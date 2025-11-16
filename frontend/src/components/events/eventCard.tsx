import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import type { Event } from "../../store/slices/eventsSlice";
import { Link } from "react-router-dom";
import { formatDate, formatTime } from "../../utils/dateFormator";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

const EventCard = React.memo(
  ({ event, viewMode }: { event: Event; viewMode: "grid" | "list" }) => {
    const getEventStatus = (startAt: string, endAt: string) => {
      const now = new Date();
      const start = new Date(startAt);
      const end = new Date(endAt);

      if (start > now)
        return { status: "upcoming", color: "bg-blue-100 text-blue-800" };
      if (start <= now && end >= now)
        return { status: "ongoing", color: "bg-green-100 text-green-800" };
      return { status: "completed", color: "bg-gray-100 text-gray-800" };
    };

    const statusInfo = getEventStatus(event?.startAt, event?.endAt);

    return (
      <motion.div
        variants={itemVariants}
        layout
        whileHover={{
          y: -4,
          transition: { type: "spring", stiffness: 400 },
        }}
        className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden ${
          viewMode === "list" ? "flex" : ""
        }`}
      >
        {/* Event Image/Thumbnail */}
        <div
          className={`${viewMode === "list" ? "w-48 flex-shrink-0" : "h-48"} bg-gradient-to-br from-blue-500 to-purple-600 relative`}
        >
          <div className="w-full h-full flex items-center justify-center text-white">
            <Calendar className="h-12 w-12 opacity-50" />
          </div>
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
            >
              {statusInfo.status}
            </span>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {event.title}
            </h3>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Event Meta */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                {formatDate(event.startAt)} • {formatTime(event.startAt)}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{event.participants?.length || 0} participants</span>
              </div>
            </div>

            <Link
              to={`/events/${event.id || event._id}`}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group"
            >
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }
);

export default EventCard;
