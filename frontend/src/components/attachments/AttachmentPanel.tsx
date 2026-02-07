"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { attachmentService } from "@/services/attachmentService";
import type { TransactionAttachment } from "@/types/attachment";
import { toast } from "sonner";
import {
  Upload, FileText, Image as ImageIcon, Trash2,
  Download, Loader2, FileSpreadsheet, File, AlertCircle, Eye, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Constants ---
const MAX_FILES = 10;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tiff", ".tif",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv",
]);
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff",
  "application/pdf",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv",
]);
const ACCEPT = ".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff,.tif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";

// --- Helpers ---
interface AttachmentPanelProps {
  transactionId: string;
  transactionRef: string;
  readonly?: boolean;
}

const isImage = (ct: string) => ct.startsWith("image/");
const isPdf = (ct: string) => ct === "application/pdf";
const isSpreadsheet = (ct: string) => ct.includes("spreadsheet") || ct.includes("excel") || ct === "text/csv";
const isPreviewable = (ct: string) => isImage(ct) || isPdf(ct);

function fileIcon(contentType: string) {
  if (isImage(contentType)) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (isPdf(contentType)) return <FileText className="h-5 w-5 text-red-500" />;
  if (isSpreadsheet(contentType)) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function getDownloadUrl(att: TransactionAttachment): string {
  return `${API_BASE}/TransactionAttachments/${att.id}/download`;
}

export function AttachmentPanel({ transactionId, transactionRef, readonly: isReadonly = false }: AttachmentPanelProps) {
  const [attachments, setAttachments] = useState<TransactionAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransactionAttachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<TransactionAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = attachments.reduce((sum, a) => sum + a.fileSize, 0);
  const slotsUsed = attachments.length;
  const slotsLeft = MAX_FILES - slotsUsed;
  const bytesLeft = MAX_TOTAL_BYTES - totalSize;
  const isFull = slotsLeft <= 0 || bytesLeft <= 0;
  const usagePercent = Math.min(100, (totalSize / MAX_TOTAL_BYTES) * 100);

  const fetchAttachments = useCallback(async () => {
    try { setIsLoading(true); setAttachments(await attachmentService.getByTransaction(transactionId)); }
    catch { toast.error("Failed to load attachments"); }
    finally { setIsLoading(false); }
  }, [transactionId]);

  useEffect(() => { fetchAttachments(); }, [fetchAttachments]);

  const validateFiles = (files: File[]): string | null => {
    if (files.length + slotsUsed > MAX_FILES) return `Maximum ${MAX_FILES} files. You have ${slotsUsed}, can add ${Math.max(0, slotsLeft)} more.`;
    const incomingSize = files.reduce((s, f) => s + f.size, 0);
    if (totalSize + incomingSize > MAX_TOTAL_BYTES) return `Maximum 15MB total. ${formatSize(Math.max(0, bytesLeft))} remaining.`;
    for (const f of files) {
      const ext = getExtension(f.name);
      if (!ext || !ALLOWED_EXTENSIONS.has(ext)) return `"${f.name}" has an unsupported file type.`;
      if (f.type && !ALLOWED_TYPES.has(f.type)) return `"${f.name}" has an unsupported content type.`;
    }
    return null;
  };

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    const error = validateFiles(files);
    if (error) { toast.error(error); return; }
    try { setIsUploading(true); await attachmentService.upload(transactionId, files); toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`); await fetchAttachments(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { setIsDeleting(true); await attachmentService.delete(deleteTarget.id); toast.success("File deleted"); setDeleteTarget(null); await fetchAttachments(); }
    catch { toast.error("Failed to delete file"); }
    finally { setIsDeleting(false); }
  };

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (isFull) { toast.error("Limit reached"); return; } handleUpload(Array.from(e.dataTransfer.files)); };
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { handleUpload(Array.from(e.target.files || [])); e.target.value = ""; };

  return (
    <TooltipProvider delayDuration={0}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {isReadonly ? "Documents" : `Attachments for ${transactionRef}`}
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {slotsUsed}{!isReadonly && `/${MAX_FILES}`} file{slotsUsed !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Usage bar — edit mode only */}
          {!isReadonly && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Storage used</span>
                <span>{formatSize(totalSize)} / {formatSize(MAX_TOTAL_BYTES)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full transition-all ${usagePercent > 90 ? "bg-destructive" : usagePercent > 70 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
          )}

          {/* Drop zone — edit mode only */}
          {!isReadonly && (
            <>
              {isFull ? (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Limit reached</p>
                    <p className="text-xs text-muted-foreground">{slotsLeft <= 0 ? `Maximum ${MAX_FILES} files.` : "Maximum 15MB total. Delete files to upload more."}</p>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"}`}
                >
                  {isUploading ? <Loader2 className="h-7 w-7 animate-spin text-primary" /> : <Upload className="h-7 w-7 text-muted-foreground" />}
                  <div className="text-center">
                    <p className="text-sm font-medium">{isUploading ? "Uploading..." : "Drop files here or click to browse"}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Images, PDFs, Word, Excel, CSV, TXT &middot; {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} &middot; {formatSize(bytesLeft)} left</p>
                  </div>
                  <input ref={fileInputRef} type="file" multiple className="hidden" accept={ACCEPT} onChange={onFileSelect} />
                </div>
              )}
            </>
          )}

          {/* Loading */}
          {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

          {/* Files list */}
          {!isLoading && attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((att) => {
                const url = getDownloadUrl(att);
                return (
                  <div key={att.id} className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    {/* Thumbnail / icon — clickable for preview */}
                    <button
                      onClick={() => isPreviewable(att.contentType) ? setPreviewTarget(att) : window.open(url, "_blank")}
                      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                    >
                      {isImage(att.contentType) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={att.fileName} className="h-full w-full object-cover" />
                      ) : (
                        fileIcon(att.contentType)
                      )}
                    </button>

                    {/* Info */}
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => isPreviewable(att.contentType) ? setPreviewTarget(att) : window.open(url, "_blank")}>
                      <p className="truncate text-sm font-medium">{att.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(att.fileSize)} &middot; {new Date(att.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {isPreviewable(att.contentType) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewTarget(att)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Preview</p></TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <a href={url} download={att.fileName}>
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Download</p></TooltipContent>
                      </Tooltip>
                      {!isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(att)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Delete</p></TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && attachments.length === 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">{isReadonly ? "No documents attached" : "No files attached yet"}</p>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewTarget} onOpenChange={(open) => { if (!open) setPreviewTarget(null); }}>
        <DialogContent
          showCloseButton={false}
          className="p-0 overflow-hidden flex flex-col gap-0 rounded-xl"
          style={{ width: "calc(100vw - 200px)", height: "calc(100vh - 160px)", maxWidth: "calc(100vw - 200px)", maxHeight: "calc(100vh - 160px)" }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b shrink-0 bg-card">
            <div className="min-w-0">
              <DialogHeader>
                <DialogTitle className="truncate text-sm">{previewTarget?.fileName}</DialogTitle>
              </DialogHeader>
              {previewTarget && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{formatSize(previewTarget.fileSize)} &middot; {previewTarget.contentType}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={previewTarget ? getDownloadUrl(previewTarget) : "#"} download={previewTarget?.fileName}>
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
          {/* Preview area — fixed, fills remaining space */}
          <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-black/5 dark:bg-white/5">
            {previewTarget && isImage(previewTarget.contentType) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getDownloadUrl(previewTarget)}
                alt={previewTarget.fileName}
                className="h-full w-full object-contain"
              />
            )}
            {previewTarget && isPdf(previewTarget.contentType) && (
              <iframe
                src={getDownloadUrl(previewTarget)}
                className="h-full w-full"
                title={previewTarget.fileName}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      {!isReadonly && (
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete file</AlertDialogTitle>
              <AlertDialogDescription>Delete &quot;{deleteTarget?.fileName}&quot;? This will remove it from storage permanently.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </TooltipProvider>
  );
}
