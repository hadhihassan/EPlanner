import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, FileText } from "lucide-react";
import { getEventAPI } from "../../api/events.api";
import ChatBox from "../../components/events/ChatBox";
import ParticipantList from "../../components/events/ParticipantList";
import EventHeader from "../../components/events/EventHeader";
import FileAttachments from "../../components/events/FileAttachments";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import type { IEvent } from "../../types/event.types";
import { DateFormatter } from "../../utils/dateFormator";
import EventDetailsContent from "../../components/events/EventDetails";
import EventDetailsSkeleton from "../../components/events/EventSkeleton";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventById = async () => {
    try {
      setIsLoading(true);
      const ev = await getEventAPI(id!);

      if (ev) {
        ev.id = ev.id || ev._id;
        ev._id = ev._id || ev.id;
      }
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
      <EventHeader event={event} onRefresh={fetchEventById} />

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
                  className={`flex items-center gap-2 rounded-md ${activeTab === "details" && "text-white rounded-md bg-gradient-to-br from-blue-500 to-purple-600"}`}
                >
                  <FileText className="w-4 h-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className={`flex items-center gap-2 rounded-md ${activeTab === "chat" && "text-white rounded-md bg-gradient-to-br from-blue-500 to-purple-600"}`}
                >
                  <Users className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className={`flex items-center gap-2 rounded-md ${activeTab === "files" && "text-white rounded-md bg-gradient-to-br from-blue-500 to-purple-600"}`}
                >
                  <FileText className="w-4 h-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className={`flex items-center gap-2 rounded-md ${activeTab === "participants" && "text-white rounded-md bg-gradient-to-br from-blue-500 to-purple-600"}`}
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
                  <ChatBox eventId={(event.id || event._id || id)!} />
                </motion.div>
              </TabsContent>

              <TabsContent value="files">
                <FileAttachments
                  attachments={event.attachments}
                  eventId={(event.id || event._id || id)!}
                />
              </TabsContent>

              <TabsContent value="participants">
                <ParticipantList
                  participants={event.participants as string[]}
                  organizer={event.organizer as string}
                  eventId={event.id || id!}
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
                    {DateFormatter.formatMessageTimestamp(event.startAt)} -{" "}
                    {DateFormatter.formatMessageTimestamp(event?.endAt || "")}
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
