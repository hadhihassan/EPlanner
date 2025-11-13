import { motion } from "framer-motion";
import { Users, Mail, Crown, Circle, MessageCircle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import type { User } from "../../types/auth.types";
import AddUsers from "./addUsers";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import useSocket from "../../hooks/useSocket";
import { getUsersByIds } from "../../api/user.api";

interface ParticipantListProps {
  participants: string[];
  organizer: string;
  onParticipantsUpdate?: (users: User[]) => void;
  eventId: string;
}

interface OnlineUser {
  userId: string;
  userData: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  lastSeen: string;
}

export default function ParticipantList({
  participants,
  organizer,
  onParticipantsUpdate,
  eventId,
}: ParticipantListProps) {
  const [globalOnlineUsers, setGlobalOnlineUsers] = useState<OnlineUser[]>([]);
  const [eventOnlineUsers, setEventOnlineUsers] = useState<OnlineUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { token, user: currentUser } = useAppSelector((s) => s.auth);
  const { socket } = useSocket(token || undefined);

  const getParticipantName = (participant: User): string => {
    return participant.name || participant.email || "Unknown User";
  };

  const getParticipantEmail = (participant: User): string => {
    return participant.email || "";
  };

  const getParticipantId = (participant: User): string => {
    return participant.id || participant._id || "";
  };

  const isOrganizer = (participant: User): boolean => {
    const participantId = getParticipantId(participant);
    return participantId === organizer;
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUsersAdd = (users: User[]) => {
    onParticipantsUpdate?.(users);
  };

  // Check if a participant is globally online (anywhere in app)
  const isUserGloballyOnline = (participant: User): boolean => {
    const participantId = getParticipantId(participant);
    return globalOnlineUsers.some(
      (onlineUser) => onlineUser.userId === participantId
    );
  };

  // Check if a participant is in this specific event
  const isUserInThisEvent = (participant: User): boolean => {
    const participantId = getParticipantId(participant);
    return eventOnlineUsers.some(
      (onlineUser) => onlineUser.userId === participantId
    );
  };

  // Get status badge color and text
  const getUserStatus = (participant: User) => {
    const isGlobalOnline = isUserGloballyOnline(participant);
    const isInEvent = isUserInThisEvent(participant);

    if (isInEvent) {
      return {
        color: "bg-green-500",
        text: "In this event",
        icon: MessageCircle
      };
    } else if (isGlobalOnline) {
      return {
        color: "bg-blue-500",
        text: "Online",
        icon: Circle
      };
    } else {
      return {
        color: "bg-gray-400",
        text: "Offline",
        icon: Circle
      };
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleGlobalOnlineUsers = (users: OnlineUser[]) => {
      console.log('🌐 Global online users:', users);
      setGlobalOnlineUsers(users);
    };

    const handleEventOnlineUsers = (users: OnlineUser[]) => {
      console.log('🎯 Event online users:', users);
      setEventOnlineUsers(users);
    };

    // Set up listeners for both types
    socket.on("globalOnlineUsers", handleGlobalOnlineUsers);
    socket.on("eventOnlineUsers", handleEventOnlineUsers);

    // Request initial data
    if (socket.connected) {
      socket.emit("joinEvent", { eventId });
    }

    return () => {
      socket.off("globalOnlineUsers", handleGlobalOnlineUsers);
      socket.off("eventOnlineUsers", handleEventOnlineUsers);
    };
  }, [socket, eventId]);

  const fetchParticipants = async () => {
    try {
      const allUserIds = [...participants, organizer].filter(id => id);
      if (allUserIds.length === 0) return;
      
      const usersData = await getUsersByIds(allUserIds);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [participants, organizer]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border p-6"
    >
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Participants
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>In event ({eventOnlineUsers.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Online ({globalOnlineUsers.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Offline</span>
              </div>
            </div>
          </div>
        </div>

        <AddUsers
          onUsersAdd={handleUsersAdd}
          maxUsers={50}
          placeholder="Add team members..."
          compact={true}
          eventId={eventId}
        />
      </div>

      {/* Participants List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {users.map((participant, index) => {
          const status = getUserStatus(participant);
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={getParticipantId(participant) || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Avatar with Status Indicator */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(getParticipantName(participant))}
                </div>
                
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1">
                  <div className="relative">
                    <StatusIcon className={`w-3 h-3 ${status.color} text-white rounded-full`} />
                    {status.color === "bg-green-500" && (
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {getParticipantId(participant) === currentUser?.id
                      ? "You"
                      : getParticipantName(participant)}
                  </span>
                  {isOrganizer(participant) && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {getParticipantEmail(participant) && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">
                        {getParticipantEmail(participant)}
                      </span>
                    </div>
                  )}
                  
                  {getParticipantEmail(participant) && <span>•</span>}
                  
                  <div className={`flex items-center gap-1 ${
                    status.color === "bg-green-500" ? "text-green-600" :
                    status.color === "bg-blue-500" ? "text-blue-600" : "text-gray-400"
                  }`}>
                    <StatusIcon className={`w-2 h-2 ${status.color}`} />
                    <span>{status.text}</span>
                  </div>
                </div>
              </div>

              {isOrganizer(participant) ? (
                <Badge
                  variant="default"
                  className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  Organizer
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                >
                  Member
                </Badge>
              )}
            </motion.div>
          );
        })}

        {users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium mb-1">No participants yet</p>
            <p className="text-xs">Add team members to get started</p>
          </motion.div>
        )}
      </div>

      {/* Connection Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-green-500" />
              <span>In this event ({eventOnlineUsers.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="w-3 h-3 text-blue-500" />
              <span>Online anywhere ({globalOnlineUsers.length})</span>
            </div>
          </div>
          {socket && (
            <div
              className={`flex items-center gap-1 ${socket.connected ? "text-green-600" : "text-red-600"}`}
            >
              <Circle
                className={`w-2 h-2 ${socket.connected ? "fill-green-500" : "fill-red-500"}`}
              />
              <span>{socket.connected ? "Connected" : "Disconnected"}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}