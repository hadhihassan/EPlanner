import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Edit2,
  Trash,
  MoreVertical,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteEvent } from "../../store/slices/eventsSlice";
import EditEventModal from "./EditEventModal";
import { useState, useRef, useEffect } from "react";
import type { IEvent } from "../../types/event.types";
import { AxiosError } from "axios";

interface EventHeaderProps {
  event: IEvent;
  onRefresh: () => void;
}

export default function EventHeader({ event, onRefresh }: EventHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const eventId = event.id || event._id || "";
      await dispatch(deleteEvent(eventId)).unwrap();

      toast({
        title: "Event deleted successfully",
        description: `"${event.title}" has been permanently deleted.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      navigate("/dashboard");
    } catch (error: unknown) {
      let errorMessage =
        "An error occurred while deleting the event. Please try again.";

      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Failed to delete event",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isOrganizer =
    user?.role !== "participant" &&
    event?.organizer === (user?.id || user?._id);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "from-green-500 to-emerald-600";
      case "draft":
        return "from-gray-500 to-gray-600";
      case "cancelled":
        return "from-red-500 to-rose-600";
      default:
        return "from-blue-500 to-purple-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b border-gray-200/60 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        {/* Main Header */}
        <div className="flex items-start justify-between gap-4">
          {/* Back Button and Event Info */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl hover:shadow-md hover:bg-white mt-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </motion.div>

            <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
              {/* Title and Badges */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="space-y-2 flex-1 min-w-0">
                  <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight break-words"
                  >
                    {event.title}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-2"
                  >
                    {event.description}
                  </motion.p>
                </div>

                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <AnimatePresence>
                    {isOrganizer && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Button
                            size="sm"
                            onClick={() => setEditOpen(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 rounded-xl px-4 py-2"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Event
                          </Button>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Button
                            size="sm"
                            onClick={handleDeleteEvent}
                            className="bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 rounded-xl px-4 py-2"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Badges and Meta Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={`bg-gradient-to-r ${getStatusColor(event?.status)} text-white border-0 shadow-lg px-3 py-1.5 text-sm font-semibold`}
                  >
                    {event?.status?.charAt(0).toUpperCase() +
                      event?.status?.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-gray-300/60 text-gray-700 px-3 py-1.5 text-sm font-medium shadow-sm"
                  >
                    {event.category}
                  </Badge>
                </div>

                {/* Mobile Meta Info */}
                <div className="flex items-center gap-4 sm:hidden text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(event.startAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location || "Virtual"}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex-shrink-0 relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="h-10 w-10 rounded-xl border border-gray-200/60 bg-white/80 shadow-sm hover:shadow-md flex items-center justify-center"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {showMenu && isOrganizer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-12 right-0 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-xl shadow-xl z-50 min-w-[140px] py-2"
                >
                  <button
                    onClick={() => {
                      setEditOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50/80 hover:text-blue-600 flex items-center gap-2 transition-colors duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Event
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteEvent();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/80 flex items-center gap-2 transition-colors duration-200"
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        event={event}
        onRefresh={onRefresh}
      />
    </motion.div>
  );
}
