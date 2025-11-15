/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchEvents, type Event } from "../../store/slices/eventsSlice";
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
  ChevronLeft,
  ChevronRight,
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
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { events, loading } = useAppSelector((s) => s.events);
  const { user } = useAppSelector((s) => s.auth);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "past">(
    "all"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      fetchEvents({
        q: debouncedSearch,
        status: filter === "all" ? undefined : filter,
        page: pagination.page,
        limit: viewMode === "grid" ? 9 : 10,
      })
    ).then((action) => {
      if (action?.payload?.pagination) {
        setPagination(action?.payload?.pagination);
      }
    });
  }, [dispatch, debouncedSearch, filter, viewMode, pagination.page]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPagination((prev) => ({ ...prev, page: newPage }));

      dispatch(
        fetchEvents({
          q: debouncedSearch,
          status: filter === "all" ? undefined : filter,
          page: newPage,
          limit: viewMode === "grid" ? 9 : 10,
        })
      ).then((action) => {
        if (action.payload?.pagination) {
          setPagination(action?.payload?.pagination);
        }
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch, debouncedSearch, filter, viewMode]
  );

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

  // Pagination component
  const Pagination = () => (
    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
      <div className="text-sm text-gray-700">
        Showing{" "}
        <span className="font-medium">
          {(pagination.page - 1) * pagination.limit + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(pagination.page * pagination.limit, pagination.total)}
        </span>{" "}
        of <span className="font-medium">{pagination.total}</span> results
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pagination.page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
          )}
        </div>

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNext}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );

  const EventCard = React.memo(
    ({ event, viewMode }: { event: Event; viewMode: "grid" | "list", }) => {
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
                (e: Event) =>
                  getEventStatus(e?.startAt, e?.endAt).status === "upcoming"
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {
              events.filter(
                (e: Event) =>
                  getEventStatus(e.startAt, e.endAt).status === "ongoing"
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Ongoing</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-600">
            {
              events.filter(
                (e: Event) =>
                  getEventStatus(e.startAt, e.endAt).status === "completed"
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
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
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
              {events.map((event: Event) => (
                <EventCard
                  key={event.id || event._id}
                  event={event}
                  viewMode={viewMode}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && <Pagination />}
        </>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {debouncedSearch
              ? "No events match your search"
              : "No events found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {debouncedSearch || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first event"}
          </p>
          {canCreateEvent && !debouncedSearch && filter === "all" && (
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
