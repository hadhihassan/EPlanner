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
  Search,
  Grid,
  List,
} from "lucide-react";
import CreateEventModal from "../../components/events/CreateEventModal";
import LoadingSpinner from "../../components/ui/Spinner";
import Pagination from "../../components/events/pagination";
import EventCard from "../../components/events/eventCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { events, loading, pagination: reduxPagination } = useAppSelector((s) => s.events);
  const { user } = useAppSelector((s) => s.auth);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "ongoing" | "past">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pagination = reduxPagination || {
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const loadEvents = async () => {
      await dispatch(
        fetchEvents({
          q: debouncedSearch,
          status: filter === "all" ? undefined : filter,
          page: 1,
          limit: viewMode === "grid" ? 9 : 10,
        })
      );
    };

    loadEvents();
  }, [dispatch, debouncedSearch, filter, viewMode]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(
        fetchEvents({
          q: debouncedSearch,
          status: filter === "all" ? undefined : filter,
          page: newPage,
          limit: viewMode === "grid" ? 9 : 10,
        })
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch, debouncedSearch, filter, viewMode]
  );

  const canCreateEvent = user?.role === "organizer" || user?.role === "admin";

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
              className="w-full pl-10 outline-none pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

          {/* Use the separated Pagination component */}
          <Pagination 
            pagination={pagination}
            onPageChange={handlePageChange}
          />
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