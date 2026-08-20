import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const contacts = [
  { id: 9, name: "Acme Corporation", email: "acme@example.com", phone: "0400000000", is_company: true },
  { id: 24, name: "Addison Olson", email: "addison@example.com", phone: null, is_company: false },
];

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders contacts returned by the API", async () => {
    mockFetch([
      jsonResponse({ status: "ok" }),
      jsonResponse({ data: contacts }),
    ]);

    render(<App />);

    expect(await screen.findByText("Acme Corporation")).toBeInTheDocument();
    expect(screen.getByText("Addison Olson")).toBeInTheDocument();
    expect(screen.getByText("Odoo #9")).toBeInTheDocument();
  });

  it("validates the create form before saving", async () => {
    const user = userEvent.setup();
    mockFetch([
      jsonResponse({ status: "ok" }),
      jsonResponse({ data: contacts }),
    ]);

    render(<App />);
    await screen.findByText("Acme Corporation");

    await user.click(screen.getByRole("button", { name: /\+ new contact/i }));
    await user.click(screen.getByRole("button", { name: /create contact/i }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
  });

  it("shows a readable API error when contacts cannot be loaded", async () => {
    mockFetch([
      jsonResponse({ status: "ok" }),
      Promise.reject(new Error("Network down")),
    ]);

    render(<App />);

    expect(await screen.findByText("Unable to load contacts")).toBeInTheDocument();
    expect(screen.getByText("Unable to reach the integration server.")).toBeInTheDocument();
  });

  it("creates a contact and reloads the Odoo-backed list", async () => {
    const user = userEvent.setup();
    const createdContacts = [
      { id: 42, name: "Portfolio Test Contact", email: "portfolio@example.com", phone: "", is_company: false },
      ...contacts,
    ];

    const fetchMock = mockFetch([
      jsonResponse({ status: "ok" }),
      jsonResponse({ data: contacts }),
      jsonResponse({ data: { id: 42 } }, 201),
      jsonResponse({ data: createdContacts }),
    ]);

    render(<App />);
    await screen.findByText("Acme Corporation");

    await user.click(screen.getByRole("button", { name: /\+ new contact/i }));
    await user.type(screen.getByLabelText(/name/i), "Portfolio Test Contact");
    await user.type(screen.getByLabelText(/email/i), "portfolio@example.com");
    await user.click(screen.getByRole("button", { name: /create contact/i }));

    expect(await screen.findByText("Portfolio Test Contact")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
  });

  it("edits a contact without sending the Odoo id in the update body", async () => {
    const user = userEvent.setup();
    const updatedContacts = [
      { ...contacts[0], phone: "0499999999" },
      contacts[1],
    ];

    const fetchMock = mockFetch([
      jsonResponse({ status: "ok" }),
      jsonResponse({ data: contacts }),
      jsonResponse({ data: { id: 9, updated: true } }),
      jsonResponse({ data: updatedContacts }),
    ]);

    render(<App />);
    await screen.findByText("Acme Corporation");

    await user.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    const phoneInput = screen.getByLabelText(/phone/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, "0499999999");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await screen.findByText("0499999999");
    const patchRequest = fetchMock.mock.calls[2][1] as RequestInit;
    expect(JSON.parse(String(patchRequest.body))).toEqual({
      name: "Acme Corporation",
      email: "acme@example.com",
      phone: "0499999999",
      is_company: true,
    });
  });
});

function mockFetch(responses: Array<Promise<Response>>) {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockImplementationOnce(() => response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}
