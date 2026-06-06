"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import SideProfilePanel from "./SideProfilePanel";
import { partnersApi, uploadsApi } from "@/services/api";

interface PartnerDetail {
  id: string;
  name: string;
  city: string;
  type: string;
  email?: string | null;
  cnpj?: string | null;
  phone?: string | null;
  score: number;
  status: string;
  logo_url?: string | null;
  address?: string | null;
  notes?: string | null;
}

interface ChatMessage {
  id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
}

interface StoredImage {
  id: string;
  path: string;
  filename: string;
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
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (!partnerId) return;
    setLoading(true);
    partnersApi
      .get(partnerId)
      .then((res) => {
        const data = res.data as {
          partner: PartnerDetail;
          images: StoredImage[];
          messages: ChatMessage[];
        };
        setPartner(data.partner);
        setImages(data.images ?? []);
        setMessages(data.messages ?? []);
      })
      .catch(() => setPartner(null))
      .finally(() => setLoading(false));
  }, [partnerId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!partnerId || !chatText.trim()) return;
    setSending(true);
    try {
      await partnersApi.sendMessage(partnerId, chatText.trim());
      setChatText("");
      load();
    } finally {
      setSending(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!partnerId) return;
    setUploading(true);
    try {
      await uploadsApi.upload(file, "partner", partnerId);
      load();
    } finally {
      setUploading(false);
    }
  }

  const imageUrls = [partner?.logo_url, ...images.map((i) => i.path)].filter(Boolean) as string[];

  return (
    <SideProfilePanel
      open={!!partnerId}
      title={partner?.name ?? "Parceiro"}
      subtitle={partner ? `${TYPE_LABEL[partner.type] ?? partner.type} • ${partner.city}` : undefined}
      onClose={onClose}
    >
      {loading ? (
        <p className="text-on-surface-variant">Carregando...</p>
      ) : partner ? (
        <div className="space-y-6">
          <section className="space-y-2 text-sm">
            <h3 className="text-label-md font-bold uppercase text-on-surface-variant">Informações</h3>
            <p><strong>CNPJ:</strong> {partner.cnpj ?? "—"}</p>
            <p><strong>E-mail:</strong> {partner.email ?? "—"}</p>
            <p><strong>Telefone:</strong> {partner.phone ?? "—"}</p>
            <p><strong>Endereço:</strong> {partner.address ?? partner.city}</p>
            <p><strong>Score:</strong> {Math.round(Number(partner.score))}/100</p>
            <span className={partner.status === "ativo" ? "chip-active" : "chip-pending"}>
              {partner.status === "ativo" ? "Ativo" : "Pendente"}
            </span>
          </section>

          <section>
            <h3 className="mb-3 text-label-md font-bold uppercase text-on-surface-variant">Imagens</h3>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => imageInputRef.current?.click()}
              className="mb-3 flex items-center gap-2 rounded-lg bg-primary-container px-3 py-2 text-sm font-medium text-on-primary-container"
            >
              <Icon name="add_photo_alternate" />
              {uploading ? "Salvando..." : "Adicionar Imagem"}
            </button>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${url}-${i}`} src={url} alt="" className="h-24 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-label-md font-bold uppercase text-on-surface-variant">
              <Icon name="chat" />
              Chat direto
            </h3>
            <div className="mb-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-low p-3">
              {messages.length === 0 ? (
                <p className="text-xs text-on-surface-variant">Inicie a conversa com o parceiro.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="rounded-lg bg-surface p-2 text-sm">
                    <p className="text-[10px] font-bold text-primary">
                      {m.sender_name} • {new Date(m.created_at).toLocaleString("pt-BR")}
                    </p>
                    <p>{m.message}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={sending || !chatText.trim()}
                className="rounded-lg bg-primary px-3 py-2 text-on-primary disabled:opacity-50"
              >
                <Icon name="send" />
              </button>
            </form>
          </section>
        </div>
      ) : (
        <p className="text-on-surface-variant">Parceiro não encontrado.</p>
      )}
    </SideProfilePanel>
  );
}
