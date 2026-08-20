import type { Contact } from "../types/contact";
import { StatusBadge } from "./StatusBadge";

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  onEdit: (contact: Contact) => void;
}

export function ContactTable({ contacts, loading, onEdit }: ContactTableProps) {
  if (loading) {
    return (
      <div className="table-shell" aria-busy="true" aria-label="Loading contacts">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="skeleton-row" key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Odoo Status</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td data-label="Name">
                <div className="identity-cell">
                  <span className="avatar" aria-hidden="true">
                    {getInitials(contact.name)}
                  </span>
                  <span className="contact-name">{contact.name}</span>
                </div>
              </td>
              <td data-label="Email">{contact.email || "-"}</td>
              <td data-label="Phone">{contact.phone || "-"}</td>
              <td data-label="Type">
                <StatusBadge>{contact.is_company ? "Company" : "Individual"}</StatusBadge>
              </td>
              <td data-label="Odoo Status">
                <div className="sync-cell">
                  <StatusBadge tone="success">Synced</StatusBadge>
                  <span>Odoo #{contact.id}</span>
                </div>
              </td>
              <td className="actions-cell">
                <button className="button button-secondary button-small" type="button" onClick={() => onEdit(contact)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return `${parts[0][0]}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
