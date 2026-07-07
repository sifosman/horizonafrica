"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type KbDoc = {
  id: string;
  filename: string;
  document_type: string;
  processing_status: string;
  chunk_count: number;
  created_at: string;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function KBPage() {
  const supabase = createClient();
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [textEntry, setTextEntry] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textType, setTextType] = useState("faq");

  useEffect(() => {
    loadDocs();
  }, []);

  const processUploadedDocument = async (tenantIdValue: string, documentId: string, file: File) => {
    const formData = new FormData();
    formData.append("tenant_id", tenantIdValue);
    formData.append("document_id", documentId);
    formData.append("file", file);

    const response = await fetch(`${backendUrl}/process-document`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Document processing failed");
    }
  };

  const processTextDocument = async (
    tenantIdValue: string,
    documentId: string,
    title: string,
    documentType: string,
    content: string
  ) => {
    const response = await fetch(`${backendUrl}/process-text-entry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenant_id: tenantIdValue,
        document_id: documentId,
        title,
        document_type: documentType,
        content,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Text entry processing failed");
    }
  };

  const loadDocs = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: staff } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("email", userData.user.email)
      .single();

    if (!staff) {
      setLoading(false);
      return;
    }
    setTenantId(staff.tenant_id);

    const { data } = await supabase
      .from("knowledge_base_documents")
      .select("*")
      .eq("tenant_id", staff.tenant_id)
      .order("created_at", { ascending: false });

    setDocs(data || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;

    setUploading(true);
    const path = `${tenantId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("kb-documents")
      .upload(path, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: documentRecord, error: dbError } = await supabase
      .from("knowledge_base_documents")
      .insert({
        tenant_id: tenantId,
        filename: file.name,
        storage_path: path,
        mime_type: file.type,
        file_size_bytes: file.size,
        document_type: "general",
        processing_status: "pending",
      })
      .select("id")
      .single();

    if (dbError) {
      alert("Failed to record document: " + dbError.message);
      setUploading(false);
      return;
    }

    try {
      await processUploadedDocument(tenantId, documentRecord.id, file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Document processing failed";
      await supabase
        .from("knowledge_base_documents")
        .update({ processing_status: "failed" })
        .eq("id", documentRecord.id);
      alert(message);
    }

    setUploading(false);
    e.target.value = "";
    loadDocs();
  };

  const addTextEntry = async () => {
    if (!textEntry.trim() || !textTitle.trim() || !tenantId) return;

    setUploading(true);

    const { data: documentRecord, error } = await supabase
      .from("knowledge_base_documents")
      .insert({
        tenant_id: tenantId,
        filename: textTitle,
        mime_type: "text/plain",
        document_type: textType,
        processing_status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      alert("Failed to add: " + error.message);
      setUploading(false);
      return;
    }

    try {
      await processTextDocument(tenantId, documentRecord.id, textTitle, textType, textEntry);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Text entry processing failed";
      await supabase
        .from("knowledge_base_documents")
        .update({ processing_status: "failed" })
        .eq("id", documentRecord.id);
      alert(message);
      setUploading(false);
      return;
    }

    setTextEntry("");
    setTextTitle("");
    setUploading(false);
    loadDocs();
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Knowledge Base</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-4">Upload Document</h2>
            <p className="text-sm text-slate-500 mb-4">PDF, Word, or text files. These will be chunked and embedded for the AI.</p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <div className="text-center">
                <p className="text-sm text-slate-600">{uploading ? "Uploading..." : "Click to upload or drag and drop"}</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT up to 10MB</p>
              </div>
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.txt" />
            </label>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-900 mb-4">Add Text Entry</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title (e.g., Botox Pricing)"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <select
                value={textType}
                onChange={(e) => setTextType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="services">Services</option>
                <option value="pricing">Pricing</option>
                <option value="faq">FAQ</option>
                <option value="policies">Policies</option>
                <option value="aftercare">Aftercare</option>
                <option value="general">General</option>
              </select>
              <textarea
                placeholder="Paste or type knowledge base content here..."
                value={textEntry}
                onChange={(e) => setTextEntry(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button
                onClick={addTextEntry}
                disabled={!textEntry.trim() || !textTitle.trim()}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                Add to Knowledge Base
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Documents ({docs.length})</h2>
          </div>
          {loading ? (
            <div className="px-6 py-8 text-center text-slate-400">Loading...</div>
          ) : docs.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">No documents yet. Upload or add text above.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {docs.map((d) => (
                <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{d.filename}</p>
                    <p className="text-sm text-slate-500">{d.document_type} • {d.chunk_count} chunks</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    d.processing_status === "completed" ? "bg-green-100 text-green-700" :
                    d.processing_status === "processing" ? "bg-yellow-100 text-yellow-700" :
                    d.processing_status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {d.processing_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
