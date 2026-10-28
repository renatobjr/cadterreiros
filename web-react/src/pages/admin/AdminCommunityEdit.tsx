import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "../../components/ui/Select";
import PageLoader from "../../components/composed/PageLoader";
import { getCommunity, updateCommunity } from "../../api/admin";
import { useAdminData } from "../../features/admin/adminDataContext";
import { useToast } from "../../components/ui/toastContext";
import type { ReligiousCommunity } from "../../domain/types";

const COMMUNITY_TYPES = [
  { value: "comunidade de terreiro", label: "Comunidade de terreiro" },
  { value: "matriz africana", label: "Matriz africana" },
];

const NATIONS = [
  "angola",
  "ekiti efon",
  "jeje",
  "ketu",
  "nagô",
  "quimbanda",
  "tambor de mina",
  "umbanda",
  "outros",
].map((value) => ({ value, label: value }));

const LANGUAGES = ["yoruba", "quicongo", "umbundo", "ewe fon", "outros"].map(
  (value) => ({ value, label: value }),
);

const GENDERS = ["feminino", "masculino", "outro"].map((value) => ({
  value,
  label: value,
}));

const ETHNICITIES = ["preta", "parda", "branca", "indígena", "amarela"].map(
  (value) => ({ value, label: value }),
);

const EDUCATION = [
  "Fundamental Incompleto",
  "Fundamental Completo",
  "Segundo Grau Incompleto",
  "Segundo Grau Completo",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduação",
].map((value) => ({ value, label: value }));

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
].map((uf) => ({ value: uf, label: uf }));

/** Máscara 00000-000 usada no cadastro voluntário. */
function formatZipcode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

async function lookupZipcode(zipcode: string) {
  const digits = zipcode.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  const data = (await response.json()) as {
    erro?: boolean | string;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };

  if (data.erro) return null;
  return data;
}

const STATUS = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
];

type FormState = Record<string, string>;

function toForm(community: ReligiousCommunity): FormState {
  const address = community.communityAddress;
  return {
    religiousSpaceName: community.religiousSpaceName ?? "",
    communityType: String(community.communityType ?? ""),
    religiousSpaceNation: community.religiousSpaceNation ?? "",
    religiousSpacePraticalLanguages:
      community.religiousSpacePraticalLanguages ?? "",
    religiousSpaceYearFoundation: String(
      community.religiousSpaceYearFoundation ?? "",
    ),
    religiousSpaceLeaderName: community.religiousSpaceLeaderName ?? "",
    religiousSpacePositionName: community.religiousSpacePositionName ?? "",
    religiousSpaceLeaderFoundation:
      community.religiousSpaceLeaderFoundation ?? "",
    religiousSpaceStartedBy: community.religiousSpaceStartedBy ?? "",
    religiousSpaceNameDateStartedBy: String(
      community.religiousSpaceNameDateStartedBy ?? "",
    ).slice(0, 10),
    leaderGender: community.leaderGender ?? "",
    leaderEthnicity: community.leaderEthnicity ?? "",
    leaderEducationalLevel: community.leaderEducationalLevel ?? "",
    leaderSufferedRacism: community.leaderSufferedRacism ? "sim" : "nao",
    religiousSpaceStatus: community.religiousSpaceStatus ?? "active",
    bio: community.bio ?? "",
    street: address?.street ?? "",
    number: address?.number ?? "",
    neighborhood: address?.neighborhood ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    zipcode: address?.zipcode ?? "",
  };
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  hint,
  full,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  hint?: string;
  full?: boolean;
}) {
  return (
    <div className={`field${full ? " cadastro-full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="field__hint">{hint}</p> : null}
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/** Edição administrativa do cadastro (mock: `renderAdminEdit`). */
export function AdminCommunityEdit() {
  const { id = "" } = useParams<{ id: string }>();
  const { reload } = useAdminData();
  const { show } = useToast();
  const navigate = useNavigate();

  const [original, setOriginal] = useState<ReligiousCommunity | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCommunity(id)
      .then((data) => {
        if (!active || !data) return;
        setOriginal(data);
        setForm(toForm(data));
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar o cadastro.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const title = useMemo(
    () => original?.religiousSpaceName ?? "Editar cadastro",
    [original],
  );

  async function handleZipcodeChange(rawValue: string) {
    const value = formatZipcode(rawValue);
    setForm((current) => (current ? { ...current, zipcode: value } : current));
    setZipError("");

    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setZipLoading(true);
    const data = await lookupZipcode(value).catch(() => null);
    setZipLoading(false);

    if (!data) {
      setZipError("CEP não encontrado.");
      return;
    }

    setForm((current) =>
      current
        ? {
            ...current,
            zipcode: value,
            street: data.logradouro || current.street,
            neighborhood: data.bairro || current.neighborhood,
            city: data.localidade || current.city,
            state: data.uf || current.state,
          }
        : current,
    );
  }

  function set(key: string) {
    return (value: string) =>
      setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSubmit() {
    if (!form || !original) return;
    setError("");
    setSaving(true);
    try {
      const payload = {
        religiousSpaceName: form.religiousSpaceName.trim(),
        communityType: form.communityType,
        religiousSpaceNation: form.religiousSpaceNation,
        religiousSpacePraticalLanguages: form.religiousSpacePraticalLanguages,
        religiousSpaceYearFoundation: Number(form.religiousSpaceYearFoundation),
        religiousSpaceLeaderName: form.religiousSpaceLeaderName.trim(),
        religiousSpacePositionName: form.religiousSpacePositionName.trim(),
        religiousSpaceLeaderFoundation:
          form.religiousSpaceLeaderFoundation.trim(),
        religiousSpaceStartedBy: form.religiousSpaceStartedBy.trim(),
        religiousSpaceNameDateStartedBy:
          form.religiousSpaceNameDateStartedBy || undefined,
        leaderGender: form.leaderGender,
        leaderEthnicity: form.leaderEthnicity,
        leaderEducationalLevel: form.leaderEducationalLevel,
        leaderSufferedRacism: form.leaderSufferedRacism === "sim",
        religiousSpaceStatus: form.religiousSpaceStatus,
        bio: form.bio,
        communityAddress: {
          ...original.communityAddress,
          street: form.street,
          number: form.number,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          zipcode: form.zipcode,
        },
      } as Partial<ReligiousCommunity>;

      const ok = await updateCommunity(original.id, payload);
      if (!ok) {
        setError("Não foi possível salvar. Verifique os dados e tente novamente.");
        return;
      }
      setSaved(true);
      reload();
      show("Cadastro salvo e aguardando na fila para aprovação.");
      navigate(`/admin/cadastros/${original.id}`);
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageLoader compact label="Carregando cadastro" />
    );
  }

  if (!form) {
    return (
      <div className="admin-empty admin-empty--page">
        <p>{error || "Cadastro não encontrado."}</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-head">
        <div className="admin-page-head__text">
          <p className="eyebrow">Editar cadastro</p>
          <h1 className="display-1">{title}</h1>
          <p className="lede">
            Alterações voltam o registro para a fila de aprovação da curadoria.
          </p>
        </div>
      </div>

      {error ? (
        <p className="auth-alert" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="auth-success" role="status">
          Cadastro salvo. Ele voltou para a fila de aprovação.
        </p>
      ) : null}

      <form
        className="admin-edit-form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <section className="admin-edit-group">
          <h2 className="display-3">A comunidade</h2>
          <div className="admin-edit-grid">
            <Field
              id="edit-name"
              label="Nome da comunidade"
              value={form.religiousSpaceName}
              onChange={set("religiousSpaceName")}
              full
            />
            <div className="field">
              <label htmlFor="edit-type">Tipo de comunidade</label>
              <Select
                id="edit-type"
                value={form.communityType}
                onChange={set("communityType")}
                options={COMMUNITY_TYPES}
                placeholder="Selecione o tipo"
              />
            </div>
            <div className="field">
              <label htmlFor="edit-nation">Nação</label>
              <Select
                id="edit-nation"
                value={form.religiousSpaceNation}
                onChange={set("religiousSpaceNation")}
                options={NATIONS}
                placeholder="Selecione a nação"
              />
            </div>
            <div className="field">
              <label htmlFor="edit-language">Idioma ritual</label>
              <Select
                id="edit-language"
                value={form.religiousSpacePraticalLanguages}
                onChange={set("religiousSpacePraticalLanguages")}
                options={LANGUAGES}
                placeholder="Selecione o idioma"
              />
            </div>
            <Field
              id="edit-year"
              label="Ano de fundação"
              type="number"
              value={form.religiousSpaceYearFoundation}
              onChange={set("religiousSpaceYearFoundation")}
            />
          </div>
        </section>

        <section className="admin-edit-group">
          <h2 className="display-3">Liderança</h2>
          <div className="admin-edit-grid">
            <Field
              id="edit-leader"
              label="Nome da liderança"
              value={form.religiousSpaceLeaderName}
              onChange={set("religiousSpaceLeaderName")}
            />
            <Field
              id="edit-position"
              label="Cargo ou função"
              value={form.religiousSpacePositionName}
              onChange={set("religiousSpacePositionName")}
            />
            <Field
              id="edit-founder"
              label="Fundador da liderança"
              value={form.religiousSpaceLeaderFoundation}
              onChange={set("religiousSpaceLeaderFoundation")}
            />
            <Field
              id="edit-started-by"
              label="Quem iniciou a comunidade"
              value={form.religiousSpaceStartedBy}
              onChange={set("religiousSpaceStartedBy")}
            />
            <Field
              id="edit-started-at"
              label="Data de início"
              type="date"
              value={form.religiousSpaceNameDateStartedBy}
              onChange={set("religiousSpaceNameDateStartedBy")}
            />
            <div className="field">
              <label htmlFor="edit-gender">Gênero</label>
              <Select
                id="edit-gender"
                value={form.leaderGender}
                onChange={set("leaderGender")}
                options={GENDERS}
                placeholder="Selecione"
              />
            </div>
            <div className="field">
              <label htmlFor="edit-ethnicity">Etnia / raça-cor</label>
              <Select
                id="edit-ethnicity"
                value={form.leaderEthnicity}
                onChange={set("leaderEthnicity")}
                options={ETHNICITIES}
                placeholder="Selecione"
              />
            </div>
            <div className="field">
              <label htmlFor="edit-education">Escolaridade</label>
              <Select
                id="edit-education"
                value={form.leaderEducationalLevel}
                onChange={set("leaderEducationalLevel")}
                options={EDUCATION}
                placeholder="Selecione"
              />
            </div>
            <div className="field">
              <label htmlFor="edit-racism">Já sofreu racismo?</label>
              <Select
                id="edit-racism"
                value={form.leaderSufferedRacism}
                onChange={set("leaderSufferedRacism")}
                options={[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ]}
                placeholder="Selecione"
              />
            </div>
          </div>
        </section>

        <section className="admin-edit-group">
          <h2 className="display-3">Território</h2>
          <div className="admin-edit-grid">
            <div className="field">
              <label htmlFor="edit-zipcode">CEP</label>
              <input
                id="edit-zipcode"
                className="input"
                value={form.zipcode}
                onChange={(event) => void handleZipcodeChange(event.target.value)}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={9}
                placeholder={
                  zipLoading ? "Buscando no ViaCEP…" : "58000-000"
                }
              />
              {zipError ? <p className="field__error">{zipError}</p> : null}
            </div>
            <Field
              id="edit-street"
              label="Endereço"
              value={form.street}
              onChange={set("street")}
            />
            <Field
              id="edit-number"
              label="Número"
              value={form.number}
              onChange={set("number")}
            />
            <Field
              id="edit-neighborhood"
              label="Bairro"
              value={form.neighborhood}
              onChange={set("neighborhood")}
            />
            <div className="field">
              <label htmlFor="edit-state">Estado</label>
              <Select
                id="edit-state"
                value={form.state}
                onChange={set("state")}
                options={STATES}
                placeholder="Selecione o estado"
              />
            </div>
            <Field
              id="edit-city"
              label="Cidade"
              value={form.city}
              onChange={set("city")}
            />
          </div>
        </section>

        <section className="admin-edit-group">
          <h2 className="display-3">Publicação</h2>
          <div className="admin-edit-grid">
            <div className="field">
              <label htmlFor="edit-status">Situação do terreiro</label>
              <Select
                id="edit-status"
                value={form.religiousSpaceStatus}
                onChange={set("religiousSpaceStatus")}
                options={STATUS}
                placeholder="Selecione"
              />
            </div>
            <div className="field cadastro-full">
              <label htmlFor="edit-bio">História da comunidade</label>
              <textarea
                id="edit-bio"
                className="input"
                rows={6}
                value={form.bio}
                onChange={(event) => set("bio")(event.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="admin-savebar">
          <p className="admin-savebar__note">
            Ao salvar, o cadastro volta para a fila de aprovação.
          </p>
          <div className="admin-savebar__actions">
            <button
              className="btn btn--primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default AdminCommunityEdit;
