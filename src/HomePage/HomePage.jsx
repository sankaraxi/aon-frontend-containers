import { useState, useCallback } from "react";
import axios from "axios";

const FIELD_RULES = {
  name: {
    required: "Full name is required.",
    pattern: { value: /^[a-zA-Z\s'-]{2,80}$/, message: "Name must be 2\u201380 characters (letters only)." },
  },
  rollNumber: {
    required: "Roll number is required.",
    pattern: { value: /^[a-zA-Z0-9_-]{2,30}$/, message: "Roll number must be 2\u201330 alphanumeric characters." },
  },
};

function validate(fields) {
  const errors = {};
  for (const [key, rules] of Object.entries(FIELD_RULES)) {
    const val = (fields[key] || "").trim();
    if (!val) {
      errors[key] = rules.required;
    } else if (rules.pattern && !rules.pattern.value.test(val)) {
      errors[key] = rules.pattern.message;
    }
  }
  return errors;
}

const HomePage = () => {
  const [fields, setFields] = useState({ name: "", rollNumber: "" });
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...fields, [name]: value });
      setFieldErrors((prev) => ({ ...prev, [name]: errs[name] || null }));
    }
    setApiError(null);
    setResult(null);
  }, [fields, touched]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(fields);
    setFieldErrors((prev) => ({ ...prev, [name]: errs[name] || null }));
  }, [fields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { name: true, rollNumber: true };
    setTouched(allTouched);
    const errs = validate(fields);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/generate-test-link`,
        { name: fields.name.trim(), rollNumber: fields.rollNumber.trim() },
        { timeout: 15000 }
      );
      setResult(res.data);
    } catch (err) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setApiError("Request timed out. Please check your connection and try again.");
      } else if (!err.response) {
        setApiError("Unable to reach the server. Please check your internet connection.");
      } else {
        const status = err.response.status;
        const serverMsg =
          err.response?.data?.message ||
          err.response?.data?.details ||
          err.response?.data?.error;
        if (status === 409) {
          const existingLink = err.response?.data?.existing_link;
          if (existingLink) {
            setResult({ test_link: existingLink, already_existed: true });
          } else {
            setApiError(serverMsg || "A test link for this roll number already exists.");
          }
        } else if (status === 422) {
          setApiError(serverMsg || "Invalid data submitted. Please review your inputs.");
        } else if (status >= 500) {
          setApiError("A server error occurred. Please try again later.");
        } else {
          setApiError(serverMsg || `Unexpected error (${status}). Please try again.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.test_link) {
      navigator.clipboard.writeText(result.test_link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoMark}>KG</div>
          <h1 style={styles.title}>Frontend Assessment Portal</h1>
          <p style={styles.subtitle}>Enter your details to receive your personalised test link.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <Field
            id="name"
            label="Full Name"
            name="name"
            type="text"
            placeholder=""
            value={fields.name}
            error={fieldErrors.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="name"
          />

          <Field
            id="rollNumber"
            label="Roll Number"
            name="rollNumber"
            type="text"
            placeholder=""
            value={fields.rollNumber}
            error={fieldErrors.rollNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
          />

          {apiError && (
            <div style={styles.errorBanner} role="alert" aria-live="assertive">
              <span style={styles.errorBannerIcon}>&#9888;</span>
              <span>{apiError}</span>
            </div>
          )}

          <button
            type="submit"
            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span style={styles.spinnerRow}>
                <Spinner /> Generating link&hellip;
              </span>
            ) : (
              "Generate Test Link"
            )}
          </button>
        </form>

        {result && (
          <div style={styles.resultCard} role="status" aria-live="polite">
            <div style={styles.resultHeader}>
              <span style={styles.successIcon}>&#10003;</span>
              <span style={styles.successTitle}>
                {result.already_existed ? "Test Link Already Generated" : "Link Generated Successfully"}
              </span>
            </div>
            {result.already_existed && (
              <div style={{ ...styles.warnBanner, marginBottom: 12 }} role="note">
                <span style={styles.errorBannerIcon}>&#8505;</span>
                <span>A test link was previously generated for this roll number. Use the link below.</span>
              </div>
            )}

            {result.aon_id && (
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>AON ID</span>
                <span style={styles.metaValue}>{result.aon_id}</span>
              </div>
            )}

            {result.test_link ? (
              <div style={styles.linkGroup}>
                <a
                  href={result.test_link}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={styles.startButton}
                >
                  Start Test &rarr;
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={styles.copyButton}
                  aria-label="Copy test link to clipboard"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            ) : (
              <div style={styles.warnBanner} role="alert">
                <span style={styles.errorBannerIcon}>&#9888;</span>
                <span>Test link was not returned by the server. Please contact support.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ id, label, name, type, placeholder, value, error, onChange, onBlur, autoComplete }) => (
  <div style={styles.fieldGroup}>
    <label htmlFor={id} style={styles.label}>
      {label} <span style={styles.required} aria-hidden="true">*</span>
    </label>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete={autoComplete}
      aria-required="true"
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
    />
    {error && (
      <span id={`${id}-error`} style={styles.fieldError} role="alert">
        {error}
      </span>
    )}
  </div>
);

const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: "spin 0.75s linear infinite", marginRight: 8 }}
    aria-hidden="true"
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

const BRAND = "#4F46E5";
const DANGER = "#DC2626";
const DANGER_BG = "#FEF2F2";
const SUCCESS = "#16A34A";
const SUCCESS_BG = "#F0FDF4";
const WARN_BG = "#FFFBEB";
const WARN_TEXT = "#92400E";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
    padding: "24px 16px",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px -4px rgba(79,70,229,0.12)",
    border: "1px solid rgba(79,70,229,0.08)",
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  logoMark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 12,
    background: BRAND,
    color: "#fff",
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 12,
    letterSpacing: "-1px",
  },
  title: {
    margin: "0 0 6px",
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    letterSpacing: "0.01em",
  },
  required: {
    color: DANGER,
    marginLeft: 2,
  },
  input: {
    padding: "10px 14px",
    fontSize: 14,
    borderRadius: 8,
    border: "1.5px solid #D1D5DB",
    outline: "none",
    color: "#111827",
    background: "#FAFAFA",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
    width: "100%",
  },
  inputError: {
    borderColor: DANGER,
    background: DANGER_BG,
  },
  fieldError: {
    marginTop: 5,
    fontSize: 12,
    color: DANGER,
    fontWeight: 500,
  },
  errorBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "12px 14px",
    borderRadius: 8,
    background: DANGER_BG,
    border: "1px solid #FECACA",
    color: "#991B1B",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  errorBannerIcon: {
    flexShrink: 0,
    fontWeight: 700,
    marginTop: 1,
  },
  button: {
    width: "100%",
    padding: "12px 20px",
    background: BRAND,
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
    letterSpacing: "0.01em",
    transition: "background 0.15s, opacity 0.15s",
  },
  buttonDisabled: {
    background: "#A5B4FC",
    cursor: "not-allowed",
    opacity: 0.85,
  },
  spinnerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  resultCard: {
    marginTop: 24,
    padding: "20px",
    borderRadius: 10,
    background: SUCCESS_BG,
    border: "1px solid #BBF7D0",
  },
  resultHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  successIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: SUCCESS,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#14532D",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    padding: "8px 12px",
    background: "#DCFCE7",
    borderRadius: 6,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  metaValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#14532D",
    fontFamily: "monospace",
  },
  linkGroup: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  startButton: {
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    background: BRAND,
    color: "#fff",
    borderRadius: 7,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.01em",
    minWidth: 120,
  },
  copyButton: {
    padding: "10px 16px",
    background: "#fff",
    color: BRAND,
    border: `1.5px solid ${BRAND}`,
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
  },
  warnBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 8,
    background: WARN_BG,
    border: "1px solid #FDE68A",
    color: WARN_TEXT,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.5,
  },
};

export default HomePage;