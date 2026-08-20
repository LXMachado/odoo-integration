import { useEffect, useMemo, useState } from "react";
import { createContact, getContacts, getHealth, updateContact } from "./api/contacts";
import { ContactForm } from "./components/ContactForm";
import { ContactTable } from "./components/ContactTable";
import { ErrorMessage } from "./components/ErrorMessage";
import type { ApiError, Contact, CreateContactInput } from "./types/contact";

type HealthState = "checking" | "connected" | "unavailable";
type SheetState =
  | { open: false }
  | { open: true; mode: "create"; contact?: undefined }
  | { open: true; mode: "edit"; contact: Contact };

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthState>("checking");
  const [sheet, setSheet] = useState<SheetState>({ open: false });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void checkHealth();
    void loadContacts();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const hasContacts = useMemo(() => contacts.length > 0, [contacts]);

  async function checkHealth() {
    setHealth("checking");
    try {
      setHealth((await getHealth()) ? "connected" : "unavailable");
    } catch {
      setHealth("unavailable");
    }
  }

  async function loadContacts() {
    setLoading(true);
    setLoadError(null);
    try {
      setContacts(await getContacts());
    } catch (error) {
      setLoadError(readableError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values: CreateContactInput & { id?: number }) {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (sheet.open && sheet.mode === "edit" && values.id) {
        const { id, ...updateValues } = values;
        await updateContact(id, updateValues);
        setSaveSuccess(true);
        await loadContacts();
        closeSheetAfterSuccess("Changes saved to Odoo.");
      } else {
        await createContact(values);
        setSaveSuccess(true);
        await loadContacts();
        closeSheetAfterSuccess("Contact created and synced with Odoo.");
      }
    } catch (error) {
      setSaveError(readableError(error));
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setSaveError(null);
    setSaveSuccess(false);
    setSheet({ open: true, mode: "create" });
  }

  function openEdit(contact: Contact) {
    setSaveError(null);
    setSaveSuccess(false);
    setSheet({ open: true, mode: "edit", contact });
  }

  function closeSheet() {
    if (!saving) {
      setSheet({ open: false });
    }
  }

  function closeSheetAfterSuccess(message: string) {
    window.setTimeout(() => {
      setSheet({ open: false });
      setSaveSuccess(false);
      setToast(message);
    }, 450);
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <header className="app-header">
          <div>
            <p className="eyebrow">Odoo Integration</p>
            <h1>Odoo Integration Dashboard</h1>
            <p>Contacts synced through Odoo 19 JSON-2 API</p>
          </div>
          <div className={`health-pill health-pill-${health}`} role="status">
            <span />
            {health === "checking" ? "Checking" : health === "connected" ? "Connected" : "Unavailable"}
          </div>
        </header>

        <div className="toolbar">
          <div>
            <h2>Contacts</h2>
            <p>{loading ? "Loading Odoo contacts..." : `${contacts.length} contact${contacts.length === 1 ? "" : "s"} returned from Odoo`}</p>
          </div>
          <button className="button button-primary" type="button" onClick={openCreate}>
            + New Contact
          </button>
        </div>

        {loadError ? (
          <ErrorMessage title="Unable to load contacts" message={loadError} actionLabel="Retry" onAction={loadContacts} />
        ) : !loading && !hasContacts ? (
          <div className="state-panel">
            <div className="state-title">No contacts found</div>
            <p>Contacts created in Odoo will appear here once synced.</p>
            <button className="button button-primary" type="button" onClick={openCreate}>
              + New Contact
            </button>
          </div>
        ) : (
          <ContactTable contacts={contacts} loading={loading} onEdit={openEdit} />
        )}
      </section>

      {sheet.open ? (
        <ContactForm
          mode={sheet.mode}
          initialContact={sheet.contact}
          saving={saving}
          apiError={saveError}
          success={saveSuccess}
          onCancel={closeSheet}
          onSubmit={handleSubmit}
        />
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function readableError(error: unknown): string {
  const apiError = error as Partial<ApiError>;
  return apiError.message || "Odoo could not complete the request. Please try again.";
}

export default App;
