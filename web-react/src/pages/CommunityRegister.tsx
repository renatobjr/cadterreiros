import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import ArrowIcon from "../components/ui/ArrowIcon";
import Select from "../components/ui/Select";

const CURRENT_YEAR = new Date().getFullYear();

interface SelectOption {
  value: string;
  label: string;
}

interface FormValues {
  religiousSpaceName: string;
  communityType: string;
  religiousSpaceNation: string;
  religiousSpacePraticalLanguages: string;
  religiousSpaceYearFoundation: string;
  religiousSpaceLeaderName: string;
  religiousSpacePositionName: string;
  religiousSpaceLeaderFoundation: string;
  religiousSpaceStartedBy: string;
  religiousSpaceNameDateStartedBy: string;
  leaderGender: string;
  leaderEthnicity: string;
  leaderEducationalLevel: string;
  leaderSufferedRacism: string;
  bio: string;
  city: string;
  neighborhood: string;
  street: string;
  number: string;
  state: string;
  zipcode: string;
  authorization: boolean;
}

interface CommunityAddressPayload {
  fullAddress: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

interface CreateCommunityPayload {
  religiousSpaceName: string;
  communityType: string;
  religiousSpaceNation: string;
  religiousSpacePraticalLanguages: string;
  religiousSpaceYearFoundation: number;
  religiousSpaceLeaderName: string;
  religiousSpaceLeaderFoundation: string;
  religiousSpacePositionName: string;
  religiousSpaceStartedBy: string;
  religiousSpaceNameDateStartedBy: string;
  leaderEthnicity: string;
  leaderGender: string;
  leaderEducationalLevel: string;
  leaderSufferedRacism: boolean;
  communityAddress: CommunityAddressPayload;
  authorization: boolean;
  bio: string;
}

interface RegisterResult {
  protocol: string | null;
  name: string;
  communityType: string;
  nation: string;
  city: string;
  neighborhood: string;
  founded: string;
  language: string;
  photoPreview: string | null;
  photoName: string;
}

interface PhotoSelection {
  preview: string;
  name: string;
}

const COMMUNITY_TYPE_OPTIONS: SelectOption[] = [
  { value: "comunidade de terreiro", label: "Comunidade de terreiro" },
  { value: "matriz africana", label: "Matriz africana" },
];

const NATION_OPTIONS: SelectOption[] = [
  { value: "angola", label: "Angola" },
  { value: "ekiti efon", label: "Ekiti Efon" },
  { value: "jeje", label: "Jeje" },
  { value: "ketu", label: "Ketu" },
  { value: "nagô", label: "Nagô" },
  { value: "quimbanda", label: "Quimbanda" },
  { value: "tambor de mina", label: "Tambor de Mina" },
  { value: "umbanda", label: "Umbanda" },
  { value: "outros", label: "Outros" },
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: "yoruba", label: "Yoruba" },
  { value: "quicongo", label: "Quicongo" },
  { value: "umbundo", label: "Umbundo" },
  { value: "ewe fon", label: "Ewe-Fon" },
  { value: "outros", label: "Outros" },
];

const GENDER_OPTIONS: SelectOption[] = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "intersexo", label: "Intersexo" },
  { value: "ns/nr", label: "Prefiro não informar" },
];

const ETHNICITY_OPTIONS: SelectOption[] = [
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "branca", label: "Branca" },
  { value: "indígena", label: "Indígena" },
  { value: "amarela", label: "Amarela" },
  { value: "ns/nr", label: "Prefiro não informar" },
];

const EDUCATIONAL_LEVEL_OPTIONS: SelectOption[] = [
  { value: "Sem escolaridade", label: "Sem escolaridade" },
  { value: "Fundamental Incompleto", label: "Fundamental incompleto" },
  { value: "Fundamental Completo", label: "Fundamental completo" },
  { value: "Segundo Grau Incompleto", label: "Ensino médio incompleto" },
  { value: "Segundo Grau Completo", label: "Ensino médio completo" },
  { value: "Superior Incompleto", label: "Superior incompleto" },
  { value: "Superior Completo", label: "Superior completo" },
  { value: "Pós-graduado", label: "Pós-graduação" },
  { value: "NS/NR", label: "Prefiro não informar" },
];

const RACISM_OPTIONS: SelectOption[] = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const STATE_OPTIONS: SelectOption[] = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
].map((uf) => ({ value: uf, label: uf }));

const EMPTY_FORM: FormValues = {
  religiousSpaceName: "",
  communityType: "",
  religiousSpaceNation: "",
  religiousSpacePraticalLanguages: "",
  religiousSpaceYearFoundation: "",
  religiousSpaceLeaderName: "",
  religiousSpacePositionName: "",
  religiousSpaceLeaderFoundation: "",
  religiousSpaceStartedBy: "",
  religiousSpaceNameDateStartedBy: "",
  leaderGender: "",
  leaderEthnicity: "",
  leaderEducationalLevel: "",
  leaderSufferedRacism: "",
  bio: "",
  city: "",
  neighborhood: "",
  street: "",
  number: "",
  state: "PB",
  zipcode: "",
  authorization: false,
};

/** Nomes curtos usados no resumo de erros. */
const FIELD_LABELS: Record<string, string> = {
  religiousSpaceName: "Nome da comunidade",
  communityType: "Tipo de comunidade",
  religiousSpaceNation: "Nação",
  religiousSpacePraticalLanguages: "Idioma ritual",
  religiousSpaceYearFoundation: "Ano de fundação",
  religiousSpaceLeaderName: "Nome da liderança",
  religiousSpacePositionName: "Cargo ou função",
  religiousSpaceLeaderFoundation: "Fundador da liderança",
  religiousSpaceStartedBy: "Quem iniciou a comunidade",
  religiousSpaceNameDateStartedBy: "Data de início",
  leaderGender: "Gênero",
  leaderEthnicity: "Etnia / raça-cor",
  leaderEducationalLevel: "Escolaridade",
  leaderSufferedRacism: "Sofreu racismo?",
  bio: "História da comunidade",
  city: "Cidade",
  neighborhood: "Bairro",
  street: "Endereço",
  number: "Número",
  state: "Estado",
  zipcode: "CEP",
  authorization: "Autorização",
};

const inputId = (name: string) => `cadastro-${name}`;
const errorId = (name: string) => `err-${name}`;
const hintId = (name: string) => `hint-${name}`;

function describedBy(name: string, error?: string, hint?: string): string | undefined {
  const ids: string[] = [];
  if (error) ids.push(errorId(name));
  if (hint) ids.push(hintId(name));
  return ids.length ? ids.join(" ") : undefined;
}

function labelOf(options: SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Aplica a máscara 00000-000 (8 dígitos) a qualquer entrada de CEP. */
function formatZipcode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

/** Extrai o protocolo tolerando resposta direta e o envelope da API. */
function extractProtocol(response: unknown): string | null {
  const root = asRecord(response);
  if (!root) return null;

  if (typeof root.id === "string" && root.id) return root.id;

  const envelope = asRecord(root.data);
  if (!envelope) return null;
  if (typeof envelope.id === "string" && envelope.id) return envelope.id;

  const inner = asRecord(envelope.data);
  if (inner && typeof inner.id === "string" && inner.id) return inner.id;

  return null;
}

/** Envelope `status: false` também é tratado como recusa explícita. */
function responseRefusal(response: unknown): string | null {
  const root = asRecord(response);
  if (!root) return null;

  const candidates = [root, asRecord(root.data)];
  for (const candidate of candidates) {
    if (candidate && candidate.status === false) {
      return "A API recusou o cadastro. Revise as informações e tente novamente.";
    }
  }
  return null;
}

function describeSubmitError(error: unknown): string {
  const response = asRecord(asRecord(error)?.response);
  const status = typeof response?.status === "number" ? response.status : null;

  if (status === 400) {
    return "A API recusou os dados enviados. Revise os campos e tente novamente.";
  }
  if (status === 403) {
    return "O envio foi recusado pela API (403). Verifique a chave de acesso configurada para o site.";
  }
  if (status === 429) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }
  return "Não foi possível enviar o cadastro. Verifique sua conexão e tente novamente.";
}

function validateForm(form: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const fail = (key: string, condition: boolean, message: string) => {
    if (condition) errors[key] = message;
  };
  const value = (key: keyof FormValues) => String(form[key]).trim();

  fail(
    "religiousSpaceName",
    value("religiousSpaceName").length < 3,
    "Informe o nome da comunidade (mínimo 3 caracteres).",
  );
  fail(
    "religiousSpaceLeaderName",
    value("religiousSpaceLeaderName").length < 3,
    "Informe o nome da liderança (mínimo 3 caracteres).",
  );
  fail("communityType", !form.communityType, "Selecione o tipo de comunidade.");
  fail("religiousSpaceNation", !form.religiousSpaceNation, "Selecione a nação.");
  fail(
    "religiousSpacePraticalLanguages",
    !form.religiousSpacePraticalLanguages,
    "Selecione o idioma ritual.",
  );

  const year = Number(value("religiousSpaceYearFoundation"));
  fail(
    "religiousSpaceYearFoundation",
    !value("religiousSpaceYearFoundation") ||
      !Number.isInteger(year) ||
      year < 1500 ||
      year > CURRENT_YEAR,
    `Informe um ano entre 1500 e ${CURRENT_YEAR}.`,
  );

  fail(
    "religiousSpacePositionName",
    !value("religiousSpacePositionName"),
    "Informe o cargo ou função da liderança.",
  );
  fail(
    "religiousSpaceLeaderFoundation",
    !value("religiousSpaceLeaderFoundation"),
    "Informe quem fundou a liderança.",
  );
  fail(
    "religiousSpaceStartedBy",
    !value("religiousSpaceStartedBy"),
    "Informe quem iniciou a comunidade.",
  );

  const startedDate = value("religiousSpaceNameDateStartedBy");
  const parsedDate = startedDate
    ? new Date(`${startedDate}T00:00:00`)
    : null;
  fail(
    "religiousSpaceNameDateStartedBy",
    !parsedDate || Number.isNaN(parsedDate.getTime()),
    "Informe a data de início.",
  );

  fail("leaderGender", !form.leaderGender, "Selecione o gênero da liderança.");
  fail(
    "leaderEthnicity",
    !form.leaderEthnicity,
    "Selecione a etnia / raça-cor da liderança.",
  );
  fail(
    "leaderEducationalLevel",
    !form.leaderEducationalLevel,
    "Selecione a escolaridade da liderança.",
  );
  fail(
    "leaderSufferedRacism",
    !form.leaderSufferedRacism,
    "Informe se a liderança já sofreu racismo.",
  );

  fail(
    "bio",
    value("bio").length < 10,
    "Conte a história da comunidade (mínimo 10 caracteres).",
  );

  fail("city", value("city").length < 2, "Informe a cidade.");
  fail(
    "neighborhood",
    value("neighborhood").length < 2,
    "Informe o bairro (mínimo 2 caracteres).",
  );
  fail("street", !value("street"), "Informe o endereço.");
  fail("number", !value("number"), "Informe o número.");
  fail("state", !value("state"), "Selecione o estado.");
  fail("zipcode", !value("zipcode"), "Informe o CEP.");

  fail(
    "authorization",
    !form.authorization,
    "É necessário autorizar a avaliação pela curadoria.",
  );

  return errors;
}

function buildPayload(form: FormValues): CreateCommunityPayload {
  const city = form.city.trim();
  const street = form.street.trim();
  const number = form.number.trim();
  const neighborhood = form.neighborhood.trim();
  const state = form.state.trim();
  const zipcode = form.zipcode.trim();

  return {
    religiousSpaceName: form.religiousSpaceName.trim(),
    communityType: form.communityType,
    religiousSpaceNation: form.religiousSpaceNation,
    religiousSpacePraticalLanguages: form.religiousSpacePraticalLanguages,
    religiousSpaceYearFoundation: Number(form.religiousSpaceYearFoundation),
    religiousSpaceLeaderName: form.religiousSpaceLeaderName.trim(),
    religiousSpaceLeaderFoundation: form.religiousSpaceLeaderFoundation.trim(),
    religiousSpacePositionName: form.religiousSpacePositionName.trim(),
    religiousSpaceStartedBy: form.religiousSpaceStartedBy.trim(),
    religiousSpaceNameDateStartedBy: form.religiousSpaceNameDateStartedBy,
    leaderEthnicity: form.leaderEthnicity,
    leaderGender: form.leaderGender,
    leaderEducationalLevel: form.leaderEducationalLevel,
    leaderSufferedRacism: form.leaderSufferedRacism === "sim",
    communityAddress: {
      fullAddress: `${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${zipcode}`,
      street,
      number,
      neighborhood,
      city,
      state,
      zipcode,
    },
    authorization: form.authorization,
    bio: form.bio.trim(),
  };
}

interface FieldBaseProps {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  full?: boolean;
  disabled?: boolean;
}

interface TextFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
  maxLength?: number;
}

function TextField({
  name,
  label,
  required,
  error,
  hint,
  full,
  disabled,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  min,
  max,
  step,
  placeholder,
  maxLength,
}: TextFieldProps) {
  return (
    <div className={`field${full ? " cadastro-full" : ""}`}>
      <div className="field__head">
        <label htmlFor={inputId(name)}>
          {label}
          {required && (
            <>
              {" "}
              <span className="req" aria-hidden="true">
                *
              </span>
            </>
          )}
        </label>
        {hint && (
          <p className="field__hint" id={hintId(name)}>
            {hint}
          </p>
        )}
      </div>
      <div className="field__control">
        <input
          id={inputId(name)}
          name={inputId(name)}
          className="input"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
        />
        {error && (
          <p className="field__error" id={errorId(name)}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

interface SelectFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
}

function SelectField({
  name,
  label,
  required,
  error,
  hint,
  full,
  disabled,
  value,
  onChange,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <div className={`field${full ? " cadastro-full" : ""}`}>
      <div className="field__head">
        <label htmlFor={inputId(name)}>
          {label}
          {required && (
            <>
              {" "}
              <span className="req" aria-hidden="true">
                *
              </span>
            </>
          )}
        </label>
        {hint && (
          <p className="field__hint" id={hintId(name)}>
            {hint}
          </p>
        )}
      </div>
      <div className="field__control">
        <Select
          id={inputId(name)}
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          invalid={Boolean(error)}
          describedBy={describedBy(name, error, hint)}
        />
        {error && (
          <p className="field__error" id={errorId(name)}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

interface TextAreaFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

function TextAreaField({
  name,
  label,
  required,
  error,
  hint,
  full,
  disabled,
  value,
  onChange,
  rows = 5,
}: TextAreaFieldProps) {
  return (
    <div className={`field${full ? " cadastro-full" : ""}`}>
      <div className="field__head">
        <label htmlFor={inputId(name)}>
          {label}
          {required && (
            <>
              {" "}
              <span className="req" aria-hidden="true">
                *
              </span>
            </>
          )}
        </label>
        {hint && (
          <p className="field__hint" id={hintId(name)}>
            {hint}
          </p>
        )}
      </div>
      <div className="field__control">
        <textarea
          id={inputId(name)}
          name={inputId(name)}
          className="input cadastro-textarea"
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
        />
        {error && (
          <p className="field__error" id={errorId(name)}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

interface SuccessViewProps {
  result: RegisterResult;
  onReset: () => void;
}

function SuccessView({ result, onReset }: SuccessViewProps) {
  return (
    <main>
      <div className="page-head">
        <div className="shell">
          <p className="eyebrow">Cadastro recebido</p>
          <h1 className="display-1">Obrigado pela contribuição</h1>
          <p className="lede">
            Recebemos as informações de <strong>{result.name}</strong> para
            avaliação da curadoria da CCIAO.
          </p>
        </div>
      </div>

      <div className="shell page-body">
        <div className="cadastro-success card">
          <div className="cadastro-success__head">
            <div>
              <p className="meta">Protocolo</p>
              <p className="cadastro-protocol">
                {result.protocol ?? "não informado"}
              </p>
            </div>
            <span className="tag">Em avaliação</span>
          </div>

          <div
            className={`cadastro-success__grid${
              result.photoPreview ? "" : " cadastro-success__grid--single"
            }`}
          >
            <div>
              <h2 className="display-3">Resumo do envio</h2>
              <dl className="deflist">
                <div>
                  <dt>Tipo</dt>
                  <dd>
                    {labelOf(COMMUNITY_TYPE_OPTIONS, result.communityType)}
                  </dd>
                </div>
                <div>
                  <dt>Nação</dt>
                  <dd>{labelOf(NATION_OPTIONS, result.nation)}</dd>
                </div>
                <div>
                  <dt>Cidade</dt>
                  <dd>{result.city || "não informado"}</dd>
                </div>
                <div>
                  <dt>Bairro</dt>
                  <dd>{result.neighborhood || "não informado"}</dd>
                </div>
                <div>
                  <dt>Fundação</dt>
                  <dd>{result.founded || "não informado"}</dd>
                </div>
                <div>
                  <dt>Idioma</dt>
                  <dd>{labelOf(LANGUAGE_OPTIONS, result.language)}</dd>
                </div>
              </dl>
            </div>

            {result.photoPreview && (
              <figure className="cadastro-success__media">
                <img
                  src={result.photoPreview}
                  alt={`Fotografia selecionada para o cadastro de ${result.name}`}
                />
                <figcaption className="meta">{result.photoName}</figcaption>
              </figure>
            )}
          </div>

          <div className="notice">
            <p className="notice__title">O que acontece agora</p>
            <p>
              A curadoria confere as informações e pode entrar em contato com a
              liderança. Com a aprovação, a comunidade passa a integrar o
              acervo público.
            </p>
          </div>

          <p className="meta cadastro-success__note">
            O cadastro entrou na fila de avaliação da curadoria da CCIAO.
          </p>

          <div className="hero__actions">
            <Link className="btn btn--primary" to="/buscar">
              Buscar um terreiro <ArrowIcon />
            </Link>
            <button className="btn btn--ghost" type="button" onClick={onReset}>
              Fazer outro cadastro
            </button>
            <Link className="btn btn--quiet" to="/">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function CommunityRegister() {
  const [form, setForm] = useState<FormValues>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const zipRequestRef = useRef(0);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [photo, setPhoto] = useState<PhotoSelection | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function updateField<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!(key in previous)) return previous;
      const next = { ...previous };
      delete next[String(key)];
      return next;
    });
  }

  async function handleZipcodeChange(rawValue: string) {
    const value = formatZipcode(rawValue);
    updateField("zipcode", value);
    setZipError(null);

    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return;

    const requestId = ++zipRequestRef.current;
    setZipLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await response.json()) as {
        erro?: boolean | string;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (requestId !== zipRequestRef.current) return;
      if (data.erro) {
        setZipError("CEP não encontrado.");
        return;
      }

      const city = data.localidade?.trim() ?? "";

      setForm((previous) => ({
        ...previous,
        zipcode: value,
        street: data.logradouro || previous.street,
        neighborhood: data.bairro || previous.neighborhood,
        city: city || previous.city,
        state: data.uf || previous.state,
      }));
      setErrors((previous) => {
        const next = { ...previous };
        delete next.zipcode;
        delete next.street;
        delete next.neighborhood;
        delete next.city;
        delete next.state;
        return next;
      });
    } catch {
      if (requestId === zipRequestRef.current) {
        setZipError("Não foi possível consultar o CEP.");
      }
    } finally {
      if (requestId === zipRequestRef.current) setZipLoading(false);
    }
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current && typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = null;

    const preview =
      typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(file)
        : "";
    if (preview) objectUrlRef.current = preview;
    setPhoto({ preview, name: file.name });
  }

  function removePhoto() {
    if (objectUrlRef.current && typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = null;
    setPhoto(null);
  }

  function resetForm() {
    removePhoto();
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setSubmitError(null);
    setResult(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const validation = validateForm(form);
    setErrors(validation);
    setSubmitError(null);

    const firstError = Object.keys(validation)[0];
    if (firstError) {
      document.getElementById(inputId(firstError))?.focus();
      return;
    }

    const city = form.city.trim();
    const payload = buildPayload(form);
    setSubmitting(true);

    try {
      const response = await client.post(
        "religious-communities/public/create",
        payload,
      );
      const refusal = responseRefusal(response);
      if (refusal) {
        setSubmitError(refusal);
        return;
      }

      setResult({
        protocol: extractProtocol(response),
        name: form.religiousSpaceName.trim(),
        communityType: form.communityType,
        nation: form.religiousSpaceNation,
        city,
        neighborhood: form.neighborhood.trim(),
        founded: form.religiousSpaceYearFoundation,
        language: form.religiousSpacePraticalLanguages,
        photoPreview: photo?.preview ?? null,
        photoName: photo?.name ?? "",
      });
    } catch (error) {
      setSubmitError(describeSubmitError(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <SuccessView result={result} onReset={resetForm} />;
  }

  const errorKeys = Object.keys(errors);

  return (
    <main>
      <div className="page-head">
        <div className="shell">
          <p className="eyebrow">Participação</p>
          <h1 className="display-1">Cadastro voluntário</h1>
          <p className="lede">
            Sua comunidade não está no mapa? Envie as informações para a
            curadoria da CCIAO. O cadastro é avaliado antes de entrar no acervo
            público.
          </p>
        </div>
      </div>

      <div className="shell page-body">
        <form className="cadastro-layout" onSubmit={handleSubmit} noValidate>
          <p className="meta cadastro-required-note">
            Campos com{" "}
            <span className="req" aria-hidden="true">
              *
            </span>{" "}
            são obrigatórios.
          </p>
          {errorKeys.length > 0 && (
            <div className="form-error-summary" role="alert">
              <p className="form-error-summary__title">
                Revise os campos abaixo
              </p>
              <ul>
                {errorKeys.map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById(inputId(key))?.focus()
                      }
                    >
                      {FIELD_LABELS[key] ?? key}
                    </button>
                    <span>{errors[key]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {submitError && (
            <div className="form-error-summary" role="alert">
              <p className="form-error-summary__title">
                Não foi possível enviar
              </p>
              <p>{submitError}</p>
            </div>
          )}

          <section className="cadastro-group">
            <h2 className="display-3">A comunidade</h2>
            <div className="cadastro-grid">
              <TextField
                name="religiousSpaceName"
                label="Nome da comunidade"
                required
                full
                value={form.religiousSpaceName}
                onChange={(value) =>
                  updateField("religiousSpaceName", value)
                }
                autoComplete="organization"
                error={errors.religiousSpaceName}
                disabled={submitting}
              />
              <TextField
                name="religiousSpaceLeaderName"
                label="Nome da liderança"
                required
                full
                value={form.religiousSpaceLeaderName}
                onChange={(value) =>
                  updateField("religiousSpaceLeaderName", value)
                }
                autoComplete="name"
                hint="Usado pela curadoria para contato; não aparece na ficha pública."
                error={errors.religiousSpaceLeaderName}
                disabled={submitting}
              />
              <SelectField
                name="communityType"
                label="Tipo de comunidade"
                required
                placeholder="Selecione o tipo"
                options={COMMUNITY_TYPE_OPTIONS}
                value={form.communityType}
                onChange={(value) => updateField("communityType", value)}
                error={errors.communityType}
                disabled={submitting}
              />
              <SelectField
                name="religiousSpaceNation"
                label="Nação"
                required
                placeholder="Selecione a nação"
                options={NATION_OPTIONS}
                value={form.religiousSpaceNation}
                onChange={(value) =>
                  updateField("religiousSpaceNation", value)
                }
                error={errors.religiousSpaceNation}
                disabled={submitting}
              />
            </div>
          </section>
          <aside className="cadastro-aside cadastro-aside--intro">
            <div className="card card--pad">
              <p className="eyebrow">Como funciona</p>
              <ol className="cadastro-steps">
                <li>
                  <span className="cadastro-step__num">01</span>
                  <div>
                    <strong>Envio</strong>
                    <p>
                      Você compartilha os dados da comunidade e, se quiser, uma
                      fotografia.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="cadastro-step__num">02</span>
                  <div>
                    <strong>Curadoria</strong>
                    <p>
                      A equipe da CCIAO confere as informações e pode pedir
                      ajustes.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="cadastro-step__num">03</span>
                  <div>
                    <strong>Publicação</strong>
                    <p>
                      Com a aprovação, a comunidade passa a integrar o acervo
                      público.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </aside>
          <section className="cadastro-group">
            <h2 className="display-3">Tradição e história</h2>
            <div className="cadastro-grid">
              <SelectField
                name="religiousSpacePraticalLanguages"
                label="Idioma ritual"
                required
                placeholder="Selecione o idioma"
                options={LANGUAGE_OPTIONS}
                value={form.religiousSpacePraticalLanguages}
                onChange={(value) =>
                  updateField("religiousSpacePraticalLanguages", value)
                }
                error={errors.religiousSpacePraticalLanguages}
                disabled={submitting}
              />
              <TextField
                name="religiousSpaceYearFoundation"
                label="Ano de fundação"
                required
                type="number"
                inputMode="numeric"
                min={1500}
                max={CURRENT_YEAR}
                step="1"
                value={form.religiousSpaceYearFoundation}
                onChange={(value) =>
                  updateField("religiousSpaceYearFoundation", value)
                }
                placeholder={`Entre 1500 e ${CURRENT_YEAR}`}
                error={errors.religiousSpaceYearFoundation}
                disabled={submitting}
              />
              <TextAreaField
                name="bio"
                label="História da comunidade"
                required
                full
                rows={6}
                value={form.bio}
                onChange={(value) => updateField("bio", value)}
                hint="Conte a origem, a liderança e as práticas que marcam a comunidade (mínimo 10 caracteres)."
                error={errors.bio}
                disabled={submitting}
              />
            </div>
          </section>
          <aside className="cadastro-aside cadastro-aside--rest">
            <div className="card card--pad">
              <p className="eyebrow">Privacidade</p>
              <p>
                Não pedimos telefone nem e-mail nesta etapa. O nome da liderança
                e o endereço detalhado são usados pela curadoria e não aparecem
                na ficha pública.
              </p>
              <p className="meta mt-6">
                Os dados são enviados apenas para a avaliação da curadoria.
              </p>
            </div>
          </aside>
          <section className="cadastro-group">
            <h2 className="display-3">Liderança</h2>
            <div className="cadastro-grid">
              <TextField
                name="religiousSpacePositionName"
                label="Cargo ou função"
                required
                value={form.religiousSpacePositionName}
                onChange={(value) =>
                  updateField("religiousSpacePositionName", value)
                }
                autoComplete="organization-title"
                error={errors.religiousSpacePositionName}
                disabled={submitting}
              />
              <TextField
                name="religiousSpaceLeaderFoundation"
                label="Fundador da liderança"
                required
                value={form.religiousSpaceLeaderFoundation}
                onChange={(value) =>
                  updateField("religiousSpaceLeaderFoundation", value)
                }
                error={errors.religiousSpaceLeaderFoundation}
                disabled={submitting}
              />
              <TextField
                name="religiousSpaceStartedBy"
                label="Quem iniciou a comunidade"
                required
                value={form.religiousSpaceStartedBy}
                onChange={(value) =>
                  updateField("religiousSpaceStartedBy", value)
                }
                error={errors.religiousSpaceStartedBy}
                disabled={submitting}
              />
              <TextField
                name="religiousSpaceNameDateStartedBy"
                label="Data de início"
                required
                type="date"
                value={form.religiousSpaceNameDateStartedBy}
                onChange={(value) =>
                  updateField("religiousSpaceNameDateStartedBy", value)
                }
                error={errors.religiousSpaceNameDateStartedBy}
                disabled={submitting}
              />
              <SelectField
                name="leaderGender"
                label="Gênero"
                required
                placeholder="Selecione o gênero"
                options={GENDER_OPTIONS}
                value={form.leaderGender}
                onChange={(value) => updateField("leaderGender", value)}
                error={errors.leaderGender}
                disabled={submitting}
              />
              <SelectField
                name="leaderEthnicity"
                label="Etnia / raça-cor"
                required
                placeholder="Selecione a etnia"
                options={ETHNICITY_OPTIONS}
                value={form.leaderEthnicity}
                onChange={(value) => updateField("leaderEthnicity", value)}
                error={errors.leaderEthnicity}
                disabled={submitting}
              />
              <SelectField
                name="leaderEducationalLevel"
                label="Escolaridade"
                required
                placeholder="Selecione a escolaridade"
                options={EDUCATIONAL_LEVEL_OPTIONS}
                value={form.leaderEducationalLevel}
                onChange={(value) =>
                  updateField("leaderEducationalLevel", value)
                }
                error={errors.leaderEducationalLevel}
                disabled={submitting}
              />
              <SelectField
                name="leaderSufferedRacism"
                label="Já sofreu racismo?"
                required
                placeholder="Selecione uma opção"
                options={RACISM_OPTIONS}
                value={form.leaderSufferedRacism}
                onChange={(value) =>
                  updateField("leaderSufferedRacism", value)
                }
                error={errors.leaderSufferedRacism}
                disabled={submitting}
              />
            </div>
          </section>
          <section className="cadastro-group">
            <h2 className="display-3">Território</h2>
            <div className="cadastro-grid">
              <TextField
                name="zipcode"
                label="CEP"
                required
                value={form.zipcode}
                onChange={handleZipcodeChange}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="58000-000"
                maxLength={9}
                hint={zipLoading ? "Buscando endereço no ViaCEP…" : "Preenche rua, bairro, cidade e estado."}
                error={errors.zipcode || zipError || undefined}
                disabled={submitting}
              />
              <TextField
                name="street"
                label="Endereço"
                required
                value={form.street}
                onChange={(value) => updateField("street", value)}
                autoComplete="street-address"
                error={errors.street}
                disabled={submitting}
              />
              <TextField
                name="number"
                label="Número"
                required
                value={form.number}
                onChange={(value) => updateField("number", value)}
                inputMode="numeric"
                error={errors.number}
                disabled={submitting}
              />
              <TextField
                name="neighborhood"
                label="Bairro"
                required
                value={form.neighborhood}
                onChange={(value) => updateField("neighborhood", value)}
                autoComplete="address-level3"
                error={errors.neighborhood}
                disabled={submitting}
              />
              <SelectField
                name="state"
                label="Estado"
                required
                placeholder="Selecione o estado"
                options={STATE_OPTIONS}
                value={form.state}
                onChange={(value) => updateField("state", value)}
                hint="Preenchido pelo CEP."
                error={errors.state}
                disabled={submitting}
              />
              <TextField
                name="city"
                label="Cidade"
                required
                value={form.city}
                onChange={(value) => updateField("city", value)}
                autoComplete="address-level2"
                placeholder="Preenchida pelo CEP"
                hint="Usamos a cidade e o bairro para localizar a comunidade no mapa."
                error={errors.city}
                disabled={submitting}
              />
            </div>
          </section>
          <section className="cadastro-group">
            <h2 className="display-3">Fotografia e autorização</h2>
            <div className="field cadastro-full">
              <label htmlFor="cadastro-photo">
                Fotografia do terreiro{" "}
                <span className="optional">(opcional)</span>
              </label>
              <input
                id="cadastro-photo"
                name="cadastro-photo"
                className="input cadastro-file"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={submitting}
                aria-describedby={hintId("photo")}
              />
              <p className="field__hint" id={hintId("photo")}>
                Uma imagem horizontal ajuda a apresentar a comunidade. A foto
                é apenas uma prévia local nesta etapa.
              </p>
              {photo?.preview && (
                <div className="cadastro-photo-preview">
                  <img
                    src={photo.preview}
                    alt="Prévia da fotografia selecionada"
                  />
                  <div className="cadastro-photo-preview__bar">
                    <span className="meta">{photo.name}</span>
                    <button
                      className="btn btn--quiet"
                      type="button"
                      onClick={removePhoto}
                    >
                      Remover foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="field cadastro-full">
              <p className="field__label">
                Autorização{" "}
                <span className="req" aria-hidden="true">
                  *
                </span>
              </p>
              <label className="check" htmlFor="cadastro-authorization">
                <input
                  id="cadastro-authorization"
                  name="cadastro-authorization"
                  type="checkbox"
                  checked={form.authorization}
                  onChange={(event) =>
                    updateField("authorization", event.target.checked)
                  }
                  aria-required="true"
                  aria-invalid={errors.authorization ? true : undefined}
                  aria-describedby={
                    errors.authorization
                      ? errorId("authorization")
                      : undefined
                  }
                  disabled={submitting}
                />
                <span>
                  Estou ciente de que este cadastro será avaliado pela Equipe
                  de Curadoria da CCIAO e que as informações poderão ser
                  usadas para divulgar a comunidade após a aprovação.
                </span>
              </label>
              {errors.authorization && (
                <p className="field__error" id={errorId("authorization")}>
                  {errors.authorization}
                </p>
              )}
            </div>
          </section>

          <div className="cadastro-actions">
            <button
              className="btn btn--primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar para curadoria"}
            </button>
            <Link className="btn btn--ghost" to="/">
              Voltar ao início
            </Link>
          </div>

          <p
            className="meta cadastro-status"
            role="status"
            aria-live="polite"
          >
            {submitting ? "Enviando cadastro para avaliação..." : ""}
          </p>
        </form>
      </div>
    </main>
  );
}

export default CommunityRegister;
