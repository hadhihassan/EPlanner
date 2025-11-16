import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Users } from "lucide-react";
import { Button } from "../ui/Button";
import Input from "../ui/Input";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import Spinner from "../ui/Spinner";
import { addParticipantsAPI, getEligibleUsersAPI } from "../../api/events.api";
import type { User } from "../../types/auth.types";
import { AxiosError } from "axios";

interface AddUsersProps {
  onUsersAdd: (users: User[]) => void;
  maxUsers?: number;
  placeholder?: string;
  eventId: string;
  compact?: boolean;
  fetchParticipants: (newUsersId?:string[]) => void
}

export default function AddUsers({
  onUsersAdd,
  maxUsers,
  placeholder = "Search users...",
  compact = false,
  eventId,
  fetchParticipants
}: AddUsersProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

  const filteredUsers = availableUsers.filter(
    (user) =>
      !selectedUsers.find((selected) => selected._id === user._id) &&
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddUser = (user: User) => {
    if (maxUsers && selectedUsers.length >= maxUsers) {
      toast({
        title: "Limit reached",
        description: `Maximum ${maxUsers} users allowed`,
        variant: "destructive",
      });
      return;
    }

    const newSelectedUsers = [...selectedUsers, user];
    setSelectedUsers(newSelectedUsers);
    onUsersAdd(newSelectedUsers);
    setSearchQuery("");
  };

  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter(
      (user) => user._id !== userId
    );
    setSelectedUsers(newSelectedUsers);
    onUsersAdd(newSelectedUsers);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleAddUserToEvent = async () => {
    try {
      setIsLoading(true);
      setIsOpen(false);

      const participantsId = selectedUsers.map((users) => users._id);
      await addParticipantsAPI(eventId, participantsId);

      toast({
        title: "Participants added!",
        description: `Successfully added ${selectedUsers.length} participant(s) to the event.`,
      });

      setSelectedUsers([]);
      onUsersAdd([]);
      fetchParticipants(participantsId)
    } catch (error: unknown) {
      let errorMessage = "An error occurred. Please try again.";

      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Failed to add participants",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await getEligibleUsersAPI(eventId);
      setAvailableUsers(res);
    } catch (error) {
      console.error("Failed to fetch availables users:", error);
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Add People
              {selectedUsers.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedUsers.length}
                </Badge>
              )}
            </>
          )}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <div className="p-3 border-b flex justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-4 py-2 h-9 text-sm outline-none focus:border-dashed focus:border-b"
                    autoFocus
                  />
                </div>
                {selectedUsers.length > 0 && (
                  <button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 py-px px-5 text-s rounded-md text-white"
                    onClick={handleAddUserToEvent}
                  >
                    add
                  </button>
                )}
              </div>

              {/* Selected Users Preview */}
              {selectedUsers.length > 0 && (
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedUsers.map((user) => (
                      <Badge
                        key={user._id}
                        variant="secondary"
                        className="flex items-center gap-1 py-1 px-2 text-xs"
                      >
                        <span>{user.name.split(" ")[0]}</span>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{selectedUsers.length} selected</span>
                    {selectedUsers.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedUsers([]);
                          onUsersAdd([]);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <div className="py-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.email}
                        onClick={() => handleAddUser(user)}
                        className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-500">
                    <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No users found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border"
        >
          {selectedUsers.map((user) => (
            <Badge
              key={user._id}
              variant="secondary"
              className="flex items-center gap-2 py-1.5 px-3"
            >
              <span className="text-sm">{user.name}</span>
              <button
                onClick={() => handleRemoveUser(user._id)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </motion.div>
      )}

      {/* Add User Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-4 py-2"
          />
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (searchQuery || filteredUsers.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {filteredUsers.length > 0 ? (
              <div className="py-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleAddUser(user)}
                    className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Limit Indicator */}
      {maxUsers && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {selectedUsers.length} of {maxUsers} users
            </span>
          </div>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => {
                setSelectedUsers([]);
                onUsersAdd([]);
              }}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
