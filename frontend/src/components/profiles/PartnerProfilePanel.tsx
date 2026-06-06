"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import SideProfilePanel from "./SideProfilePanel";
import Icon from "@/components/ui/Icon";
import { partnersApi, uploadsApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface PartnerDetail {
  id: string;
  name: string;
  city: string;
  type: string;
  email?: string | null;
  phone?: string | null;
  cnpj?: string | null;
  address?: string | null;
  score: number;
  status: string;
  logo_url?: string | null;
  notes?: string | null;
}

interface UploadRow {
  id: string;
  path: string;
  filename: string;
}

interface MessageRow {
  id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  workshop: "Oficina",
  distributor: "Distribuidora",
  dealer: "Revendedora",
};

interface PartnerProfilePanelProps {
  partnerId: string | null;
  onClose: () => void;
}

export default function PartnerProfilePanel({ partnerId, onClose }: PartnerProfilePanelProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [images, setImages] = useState<UploadRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatText, setChatText] = useState("");
  const [tab, setTab] = useState<"info" | "chat">("info");

  const load = useCallback(() => {
    if (!partnerId) return;
    setLoading(true);
    partnersApi
      .get(partnerId)
      .then((res) => {
        const data = res.data as {
          partner: PartnerDetail;
          images: UploadRow[];
          messages: MessageRow[];
        };
        setPartner(data.partner);
        setImages(data.images ?? []);
        setMessages(data.messages ?? []);
      })
      .catch(() => {
        setPartner(null);
        setImages([]);
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [partnerId]);

  useEffect(() => {
    if (partnerId) load();
    else {
      setPartner(null);
      setImages([]);
      setMessages([]);
      setTab("info");
    }
  }, [partnerId, load]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  async function handleUpload(file: File) {
    if (!partnerId) return;
    setUploading(true);
    try {
      await uploadsApi.upload(file, "partner", partnerId);
      load();
    } finally {
      setUploading(false);
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!partnerId || !chatText.trim()) return;
    setSending(true);
    try {
      await partnersApi.sendMessage(partnerId, chatText.trim());
      setChatText("");
      load();
      setTab("chat");
    } finally {
      setSending(false);
    }
  }

  return (
    <SideProfilePanel
      open={!!partnerId}
      title={partner?.name ?? "Perfil do Parceiro"}
      subtitle={partner ? `${TYPE_LABEL[partner.type] ?? partner.type} • ${partner.city}` : undefined}
      onClose={onClose}
      footer={
        tab === "chat" ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Mensagem para o parceiro..."
              className="input-fleet flex-1 !h-10"
            />
            <button type="submit" disabled={sending} className="btn-primary !px-4 !py-2">
              <Icon name="send" />
            </button>
          </form>
        ) : undefined
      }
    >
      <div className="mb-4 flex gap-1 rounded-lg bg-surface-container-high p-1">
        {(["info", "chat"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
          >
            {t === "info" ? "Informações" : "Chat"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-on-surface-variant">Carregando...</p>
      ) : !partner ? (
        <p className="text-on-surface-variant">Parceiro não encontrado.</p>
      ) : tab === "info" ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high">
              {partner.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Icon name="store" className="text-2xl text-primary" />
              )}
            </div>
            <div>
              <p className="font-bold">{partner.name}</p>
              <p className="text-sm text-on-surface-variant">{partner.city}</p>
              <span className={partner.status === "ativo" ? "chip-active" : "chip-pending"}>
                {partner.status}
              </span>
            </div>
          </div>

          <dl className="space-y-2 text-sm">
            {[
              ["E-mail", partner.email],
              ["Telefone", partner.phone],
              ["CNPJ", partner.cnpj],
              ["Endereço", partner.address],
              ["Score", `${Math.round(Number(partner.score))}/100`],
            ].map(([label, value]) =>
              value ? (
                <div key={String(label)} className="flex justify-between gap-2 border-b border-outline-variant/30 pb-2">
                  <dt className="text-on-surface-variant">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ) : null
            )}
          </dl>

          {partner.notes && (
            <p className="rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
              {partner.notes}
            </p>
          )}

          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary px-4 py-3 text-sm font-semibold text-primary"
            >
              <Icon name="add_a_photo" />
              {uploading ? "Salvando..." : "Adicionar Imagem"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              {images.map((img) => (
                <a key={img.id} href={img.path} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-outline-variant">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.path} alt={img.filename} className="h-24 w-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Inicie a conversa com {partner.name}.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_name === user?.name || m.sender_role === user?.role;
              return (
                <div
                  key={m.id}
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    mine
                      ? "ml-auto bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface"
                  }`}
                >
                  <p className="text-[10px] font-bold opacity-80">{m.sender_name}</p>
                  <p>{m.message}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
      )}
    </SideProfilePanel>
  );
}
