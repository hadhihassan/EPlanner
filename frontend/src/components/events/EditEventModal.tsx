import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Paperclip,
  Sparkles,
  Trash2,
  Eye,
} from "lucide-react";
import LoadingSpinner from "../ui/Spinner";
import { useToast } from "../ui/use-toast";
import { updateEventAPI } from "../../api/events.api";
import { categories } from "./constants";
import { eventSchema } from "../../validations/eventValidations";
import type { EventFormDataShape, IEvent } from "../../types/event.types";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent;
  onRefresh: () => void;
}

export interface Attachment {
  public_id?: string;
  url: string;
  filename: string;
  provider?: string;
  size?: number;
  type?: string;
  resource_type?: string;
}

interface NewFileWithPreview {
  file: File;
  previewUrl: string;
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  onRefresh,
}: EditEventModalProps) {
  const { toast } = useToast();
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    []
  );
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<NewFileWithPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<EventFormDataShape>({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startAt: "",
      endAt: "",
      location: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (event && isOpen) {
      const formatForDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      form.reset({
        title: event.title || "",
        description: event.description || "",
        category: event.category || "",
        startAt: event.startAt
          ? formatForDateTimeLocal("" + event?.startAt)
          : "",
        endAt: event.endAt ? formatForDateTimeLocal("" + event?.endAt) : "",
        location: event.location || "",
      });
      setExistingAttachments(event?.attachments || []);
      setRemovedPublicIds([]);
      setNewFiles([]);
    }
  }, [event, isOpen, form]);

  const handleRemoveExisting = (attachment: Attachment) => {
    if (attachment.public_id) {
      setRemovedPublicIds((prev) => [...prev, attachment.public_id || ""]);
    }
    setExistingAttachments((prev) =>
      prev.filter((a) => a.url !== attachment.url)
    );
  };

  const handleAddNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFilesWithPreview: NewFileWithPreview[] = Array.from(files).map(
      (file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })
    );

    setNewFiles((prev) => [...prev, ...newFilesWithPreview]);
    e.target.value = "";
  };

  const removeNewFile = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newFiles[index].previewUrl);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string = "", filename: string = "") => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType === "application/pdf") return "📄";
    if (fileType.includes("document")) return "📝";
    if (filename.match(/\.(zip|rar|tar|gz)$/i)) return "📦";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (values: EventFormDataShape) => {
    setSubmitting(true);
    try {
      const fd = new FormData();

      fd.append("title", values.title);
      fd.append("description", values.description);
      fd.append("category", values.category);
      fd.append("startAt", new Date(values.startAt).toISOString());
      fd.append("endAt", new Date(values.endAt).toISOString());
      fd.append("location", values.location);

      newFiles.forEach(({ file }) => {
        fd.append("files", file);
      });

      removedPublicIds.forEach((publicId) => {
        fd.append("removedPublicIds", publicId);
      });

      const eventId = event.id || event._id || "";
      await updateEventAPI(eventId, fd);

      newFiles.forEach(({ previewUrl }) => {
        URL.revokeObjectURL(previewUrl);
      });

      toast({
        title: "Event updated",
        description: "Your changes have been saved successfully.",
        variant: "success",
      });
      onRefresh();
      onClose();
    } catch (err: unknown) {
      console.error("Edit event failed", err);
      toast({
        title: "Update failed",
        description: "Unable to update event",
        variant: "default",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    newFiles.forEach(({ previewUrl }) => {
      URL.revokeObjectURL(previewUrl);
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Edit Event</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Update your event details and attachments
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex-1 overflow-auto"
            >
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    {...form.register("title")}
                    placeholder="Enter event title"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      form.formState.errors.title
                        ? "border-rose-300 bg-rose-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-rose-600 mt-2">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...form.register("description")}
                    rows={4}
                    placeholder="Describe your event..."
                    className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all ${
                      form.formState.errors.description
                        ? "border-rose-300 bg-rose-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-rose-600 mt-2">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...form.register("category")}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      form.formState.errors.category
                        ? "border-rose-300 bg-rose-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-rose-600 mt-2">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date & Time *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        {...form.register("startAt")}
                        type="datetime-local"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          form.formState.errors.startAt
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      />
                    </div>
                    {form.formState.errors.startAt && (
                      <p className="text-sm text-rose-600 mt-2">
                        {form.formState.errors.startAt.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date & Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        {...form.register("endAt")}
                        type="datetime-local"
                        min={form.watch("startAt")}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                          form.formState.errors.endAt
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      />
                    </div>
                    {form.formState.errors.endAt && (
                      <p className="text-sm text-rose-600 mt-2">
                        {form.formState.errors.endAt.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      {...form.register("location")}
                      placeholder="Enter venue or online link"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all ${
                        form.formState.errors.location
                          ? "border-rose-300 bg-rose-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                  </div>
                  {form.formState.errors.location && (
                    <p className="text-sm text-rose-600 mt-2">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>

                {/* Attachments Section */}
                <div className="space-y-4">
                  {/* Existing Attachments */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Current Attachments
                      </label>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {existingAttachments.length} files
                      </span>
                    </div>
                    <div className="space-y-2">
                      {existingAttachments.length === 0 ? (
                        <div className="text-sm text-slate-500 italic p-4 border border-dashed rounded-lg text-center bg-slate-50">
                          No existing attachments
                        </div>
                      ) : (
                        existingAttachments.map((attachment) => (
                          <div
                            key={attachment.public_id || attachment.url}
                            className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-lg">
                                {getFileIcon(
                                  attachment.type,
                                  attachment.filename
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline truncate flex items-center gap-1"
                                    title={attachment.filename}
                                  >
                                    {attachment.filename}
                                    <Eye size={14} className="text-slate-400" />
                                  </a>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-slate-500">
                                    {formatFileSize(attachment.size || 0)}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    •
                                  </span>
                                  <span className="text-xs text-slate-500 capitalize">
                                    {attachment.resource_type ||
                                      attachment.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveExisting(attachment)}
                              className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-sm font-medium px-3 py-1.5 rounded hover:bg-rose-50 transition-colors"
                              title="Remove attachment"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* New Attachments */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        New Files to Upload
                      </label>
                      {newFiles.length > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          +{newFiles.length} new
                        </span>
                      )}
                    </div>

                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors relative bg-slate-50/50">
                      <input
                        type="file"
                        multiple
                        onChange={handleAddNewFiles}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                      />
                      <Paperclip className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 font-medium">
                        Click or drag files to upload
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports images, PDFs, documents, archives (max 10MB
                        each)
                      </p>
                    </div>

                    {/* New Files List */}
                    {newFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {newFiles.map((newFile, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-lg">
                                {getFileIcon(
                                  newFile.file.type,
                                  newFile.file.name
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-blue-900 truncate">
                                  {newFile.file.name}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-blue-700">
                                    {formatFileSize(newFile.file.size)}
                                  </span>
                                  <span className="text-xs text-blue-400">
                                    •
                                  </span>
                                  <span className="text-xs text-blue-700">
                                    Ready to upload
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewFile(index)}
                              className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-sm font-medium px-3 py-1.5 rounded hover:bg-rose-50 transition-colors"
                              title="Remove file"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-all font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-medium shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
