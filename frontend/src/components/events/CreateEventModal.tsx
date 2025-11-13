import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X, Calendar, MapPin, Clock, Paperclip, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import LoadingSpinner from "../ui/Spinner";
import { createEvent } from "../../store/slices/eventsSlice";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateEventFormData {
  title: string;
  description: string;
  category: string;
  startAt: string;
  endAt: string;
  location: string;
}

interface Attachment {
  file: File; // Store the actual File object
  filename: string;
  url: string; // For preview purposes
}

const eventSchema = yup.object({
  title: yup
    .string()
    .required("Event title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: yup
    .string()
    .required("Event description is required")
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  category: yup.string().required("Please select a category"),
  startAt: yup.string().required("Start date and time are required"),
  endAt: yup
    .string()
    .required("End date and time are required")
    .test(
      "is-after-start",
      "End time must be after start time",
      function (value) {
        const { startAt } = this.parent;
        return !startAt || !value || new Date(value) > new Date(startAt);
      }
    ),
  location: yup.string().required("Location is required"),
});

const categories = [
  "Business & Professional",
  "Technology",
  "Health & Wellness",
  "Arts & Culture",
  "Education",
  "Social",
  "Sports & Fitness",
  "Entertainment",
  "Food & Drink",
  "Other",
];

export default function CreateEventModal({
  isOpen,
  onClose,
}: CreateEventModalProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.events);
  const [submiting, setSumitnig] = useState<boolean>(false)
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const form = useForm<CreateEventFormData>({
    resolver: yupResolver(eventSchema),
    mode: "onChange",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      file, 
      filename: file.name,
      url: URL.createObjectURL(file), 
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    URL.revokeObjectURL(attachments[index].url);
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateEventFormData) => {
    setSumitnig(true)
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("startAt", new Date(data.startAt).toISOString());
    formData.append("endAt", new Date(data.endAt).toISOString());
    formData.append("location", data.location);

    attachments.forEach((attachment) => {
      formData.append("files", attachment.file);
    });

    try {
      const resultAction = await dispatch(createEvent(formData as unknown as Event));
      if (createEvent.fulfilled.match(resultAction)) {
        attachments.forEach((attachment) => {
          URL.revokeObjectURL(attachment.url);
        });

        handleClose();
      } else {
        throw new Error(resultAction.payload as string);
      }
    } catch (err) {
      console.error("❌ Create event failed:", err);
    }finally{
      setSumitnig(false)
    }
  };

  const handleClose = () => {
    // Clean up all object URLs when closing
    attachments.forEach((attachment) => {
      URL.revokeObjectURL(attachment.url);
    });

    form.reset();
    setAttachments([]);
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 30, stiffness: 400 },
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex justify-between items-center">
              <h2 className="font-semibold text-lg">Create New Event</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-8 overflow-y-auto max-h-[80vh] space-y-6"
            >
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Title *
                </label>
                <input
                  {...form.register("title")}
                  id="title"
                  type="text"
                  placeholder="Enter event title"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    form.formState.errors.title
                      ? "border-rose-300 bg-rose-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-rose-600 mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  {...form.register("description")}
                  id="description"
                  rows={4}
                  placeholder="Describe your event..."
                  className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-200 ${
                    form.formState.errors.description
                      ? "border-rose-300 bg-rose-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-rose-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Category *
                </label>
                <select
                  {...form.register("category")}
                  id="category"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    form.formState.errors.category
                      ? "border-rose-300 bg-rose-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {form.formState.errors.category && (
                  <p className="text-sm text-rose-600 mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date & Time *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      {...form.register("startAt")}
                      type="datetime-local"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        form.formState.errors.startAt
                          ? "border-rose-300 bg-rose-50/50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                  </div>
                  {form.formState.errors.startAt && (
                    <p className="text-sm text-rose-600 mt-1">
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
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                        form.formState.errors.endAt
                          ? "border-rose-300 bg-rose-50/50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                  </div>
                  {form.formState.errors.endAt && (
                    <p className="text-sm text-rose-600 mt-1">
                      {form.formState.errors.endAt.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    {...form.register("location")}
                    id="location"
                    type="text"
                    placeholder="Enter venue or online link"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                      form.formState.errors.location
                        ? "border-rose-300 bg-rose-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  />
                </div>
                {form.formState.errors.location && (
                  <p className="text-sm text-rose-600 mt-1">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Event Attachments
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Paperclip className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Click or drag files here to upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Images, PDFs, or docs up to 10MB each
                  </p>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <span className="text-sm text-slate-700 truncate">
                          {attachment.filename}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submiting ? (
                    <>
                      <LoadingSpinner />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Event
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
