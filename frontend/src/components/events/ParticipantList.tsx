import { motion } from "framer-motion";
import { Users, Mail, Crown, Circle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import type { User } from "../../types/auth.types";
import AddUsers from "./addUsers";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { getUsersByIds } from "../../api/user.api";
import type { OnlineUser } from "../../types/user.types";
import { useGlobalSocket } from "../../context/SocketContext";

interface ParticipantListProps {
  participants: string[];
  organizer: string;
  onParticipantsUpdate?: (users: User[]) => void;
  eventId: string;
}

export default function ParticipantList({
  participants,
  organizer,
  onParticipantsUpdate,
  eventId,
}: ParticipantListProps) {
  const [globalOnlineUsers, setGlobalOnlineUsers] = useState<OnlineUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAppSelector((s) => s.auth);
  const { socket } = useGlobalSocket();

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

  // Check if participant is online (GLOBALLY - anywhere in the app)
  const isUserOnline = (participant: User): boolean => {
    const participantId = getParticipantId(participant);
    return globalOnlineUsers.some(
      (onlineUser) => onlineUser.userId === participantId
    );
  };

  useEffect(() => {
    if (!socket) return;

    const handleGlobal = (users: OnlineUser[]) => setGlobalOnlineUsers(users);
    const handleEvent = (users: OnlineUser[]) => setGlobalOnlineUsers(users);

    socket.on("globalOnlineUsers", handleGlobal);
    socket.on("eventOnlineUsers", handleEvent);

    if (socket.connected) {
      socket.emit("joinEvent", { eventId });
    }
  }, [socket, eventId]);

  const fetchParticipants = async (newUserParti?: string[]) => {
    try {
      const baseIds = [...participants, organizer].filter(Boolean) as string[];

      const combined = new Set<string>(baseIds);
      if (newUserParti && newUserParti.length > 0) {
        newUserParti.forEach((id) => {
          if (id) combined.add(id);
        });
      }

      const allUserIds = Array.from(combined);
      if (allUserIds.length === 0) return;

      const usersData = await getUsersByIds(allUserIds);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const onlineParticipantsCount = users.filter((p) => isUserOnline(p)).length;

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
                <span>Online ({onlineParticipantsCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Offline ({users.length - onlineParticipantsCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Total ({users.length})</span>
              </div>
            </div>
          </div>
        </div>
        {(currentUser?.role === "admin" ||
          organizer === (currentUser?._id || currentUser?.id)) && (
          <AddUsers
            onUsersAdd={handleUsersAdd}
            fetchParticipants={fetchParticipants}
            maxUsers={50}
            placeholder="Add team members..."
            compact={true}
            eventId={eventId}
          />
        )}
      </div>

      {/* Participants List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {users.map((participant, index) => {
          const isOnline = isUserOnline(participant);

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
                    <div
                      className={`w-3 h-3 ${isOnline ? "bg-green-500" : "bg-gray-400"} rounded-full border-2 border-white`}
                    />
                    {isOnline && (
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {getParticipantId(participant) ===
                    (currentUser?.id || currentUser?._id)
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

                  <div
                    className={`flex items-center gap-1 ${
                      isOnline ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    <span>{isOnline ? "Online" : "Offline"}</span>
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
            <span>Online participants: {onlineParticipantsCount}</span>
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
