import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, FileText } from "lucide-react";
import { getEventAPI } from "../../api/events.api";
import useSocket from "../../hooks/useSocket";
import { useAppSelector } from "../../store/hooks";
import ChatBox from "../../components/events/ChatBox";
import ParticipantList from "../../components/events/ParticipantList";
import EventHeader from "../../components/events/EventHeader";
import FileAttachments from "../../components/events/FileAttachments";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import type { IEvent } from "../../types/event.types";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const token = useAppSelector((s) => s.auth.token);
  const { socket, isConnected } = useSocket(token || undefined);

  const fetchEventById = async () => {
    try {
      setIsLoading(true);
      const ev = await getEventAPI(id!);
      setEvent(ev);
    } catch (error) {
      console.error("Failed to fetch event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchEventById();
  }, [id]);

  const handleReminder = () => {
    // Implement reminder logic
    console.log("Set reminder for event:", event?.id);
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600">
            The event you're looking for doesn't exist or you don't have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <EventHeader
        event={event}
        onRefresh={fetchEventById}
        onShare={handleShare}
        onReminder={handleReminder}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="details"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Participants
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <EventDetailsContent event={event} />
              </TabsContent>

              <TabsContent value="chat">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatBox eventId={event.id} socket={socket} />
                </motion.div>
              </TabsContent>

              <TabsContent value="files">
                <FileAttachments
                  attachments={event.attachments}
                  eventId={event.id}
                />
              </TabsContent>

              <TabsContent value="participants">
                <ParticipantList
                  participants={event.participants}
                  organizer={event.organizer}
                  eventId={id}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Meta */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <h3 className="font-semibold text-lg mb-3">Event Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(event.startAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>
                    {new Date(event.startAt).toLocaleTimeString()} -{" "}
                    {event.endAt && new Date(event.endAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{event.location || "Virtual Event"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{event.participants?.length || 0} participants</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for event details content
function EventDetailsContent({ event }: { event: IEvent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-lg mb-3">Description</h3>
        <p className="text-gray-700 leading-relaxed">{event.description}</p>
      </div>

      {/* Event Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="font-semibold mb-3">Event Type</h4>
          <Badge variant="secondary" className="text-sm">
            {event.category}
          </Badge>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="font-semibold mb-3">Status</h4>
          <Badge
            variant={
              event.status === "published"
                ? "default"
                : event.status === "draft"
                  ? "secondary"
                  : "destructive"
            }
          >
            {event.status}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton Loading Component
function EventDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
