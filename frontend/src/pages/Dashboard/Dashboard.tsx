import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchEvents } from "../../store/slices/eventsSlice";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Users,
  MapPin,
  Clock,
  Search,
  Grid,
  List,
  ArrowRight,
} from "lucide-react";
import CreateEventModal from "../../components/events/CreateEventModal";
import LoadingSpinner from "../../components/ui/Spinner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((s) => s.events);
  const { user } = useAppSelector((s) => s.auth);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "past">(
    "all"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  console.log('user =>', user)
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((event?.description as string) || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const now = new Date();
    const start = new Date(event.startAt);
    const end = new Date(event.endAt);

    const isUpcoming = start > now;
    const isOngoing = start <= now && end >= now;
    const isPast = end < now;

    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && isUpcoming) ||
      (filter === "ongoing" && isOngoing) ||
      (filter === "past" && isPast);

    return matchesSearch && matchesFilter;
  });

  const canCreateEvent = user?.role === "organizer" || user?.role === "admin";

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage and collaborate on your events in one place
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/calendar"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Calendar View
          </Link>
          {canCreateEvent && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Create Event 
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {events.length}
          </div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {
              events.filter(
                (e) => getEventStatus(e.startAt, e.endAt).status === "upcoming"
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {
              events.filter(
                (e) => getEventStatus(e.startAt, e.endAt).status === "ongoing"
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Ongoing</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-600">
            {
              events.filter(
                (e) => getEventStatus(e.startAt, e.endAt).status === "completed"
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value || "all")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Events Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          <AnimatePresence>
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
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
                  {event?.image ? (
                    <img
                      src={event?.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Calendar className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatus("" + event.startAt, "" + event.endAt).color}`}
                    >
                      {
                        getEventStatus("" + event.startAt, "" + event.endAt)
                          .status
                      }
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
                        {formatDate("" + event.startAt)} •{" "}
                        {formatTime("" + event.startAt)}
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
                        <span>
                          {event.participants?.length || 0} participants
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/events/${event.id}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors group"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first event"}
          </p>
          {canCreateEvent && !searchTerm && filter === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Your First Event
            </button>
          )}
        </motion.div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
