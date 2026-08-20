import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Contact, CreateContactInput } from "../types/contact";

type FormValues = CreateContactInput & { id?: number };

interface ContactFormProps {
  mode: "create" | "edit";
  initialContact?: Contact;
  saving: boolean;
  apiError: string | null;
  success: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
}

interface FormErrors {
  name?: string;
  email?: string;
}

const emptyValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  is_company: false,
};

export function ContactForm({
  mode,
  initialContact,
  saving,
  apiError,
  success,
  onCancel,
  onSubmit,
}: ContactFormProps) {
  const [values, setValues] = useState<FormValues>(initialContact ?? emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setValues(initialContact ?? emptyValues);
    setErrors({});
  }, [initialContact]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      ...values,
      name: values.name.trim(),
      email: normalizeOptional(values.email),
      phone: normalizeOptional(values.phone),
    });
  }

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === "name" || field === "email") {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onCancel}>
      <aside className="sheet" aria-label={mode === "edit" ? "Edit contact" : "New contact"} onClick={(event) => event.stopPropagation()}>
        <header className="sheet-header">
          <h2>{mode === "edit" ? "Edit Contact" : "New Contact"}</h2>
          <button className="icon-button" type="button" onClick={onCancel} disabled={saving} aria-label="Close">
            x
          </button>
        </header>

        <form onSubmit={handleSubmit} className="sheet-form">
          <div className="sheet-body">
            {mode === "edit" && initialContact ? (
              <p className="record-note">Odoo record #{initialContact.id} - Synced with Odoo</p>
            ) : null}

            {apiError ? (
              <div className="form-alert form-alert-error" role="alert">
                {apiError}
              </div>
            ) : null}

            {success ? (
              <div className="form-alert form-alert-success" role="status">
                Synced with Odoo.
              </div>
            ) : null}

            <label>
              <span>Name</span>
              <input
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Acme Corporation"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name ? (
                <span className="field-error" id="name-error">
                  {errors.name}
                </span>
              ) : null}
            </label>

            <label>
              <span>Email</span>
              <input
                value={values.email ?? ""}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email ? (
                <span className="field-error" id="email-error">
                  {errors.email}
                </span>
              ) : null}
            </label>

            <label>
              <span>Phone</span>
              <input
                value={values.phone ?? ""}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="(000)-000-0000"
              />
            </label>

            <fieldset>
              <legend>Type</legend>
              <div className="segmented-control">
                <button
                  className={!values.is_company ? "selected" : ""}
                  type="button"
                  onClick={() => updateField("is_company", false)}
                  aria-pressed={!values.is_company}
                >
                  Individual
                </button>
                <button
                  className={values.is_company ? "selected" : ""}
                  type="button"
                  onClick={() => updateField("is_company", true)}
                  aria-pressed={values.is_company}
                >
                  Company
                </button>
              </div>
            </fieldset>
          </div>

          <footer className="sheet-footer">
            <button className="button button-secondary" type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Contact"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

function normalizeOptional(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}
