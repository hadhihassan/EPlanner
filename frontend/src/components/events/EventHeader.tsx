import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit2,
  Trash,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/badge";
import type { IEvent } from "../../types/event.types";
import { deleteEventAPI } from "../../api/events.api";
import { useNavigate } from "react-router-dom";
import { Toast } from "@radix-ui/react-toast";

interface EventHeaderProps {
  event: IEvent;
  onRefresh: () => void;
  onShare: () => void;
  onReminder: () => void;
}

export default function EventHeader({
  event,
  onRefresh,
  onShare,
}: EventHeaderProps) {

  const navigate = useNavigate()

  const handleDeleteEvent = async() => {
    try {
      const res = await deleteEventAPI(event.id)
      navigate(-1)
    } catch (error) {
      console.log('error from delete event', error)
    }finally {
      console.log('completed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {event.title}
              </h1>
              <p className="text-gray-600 mt-1">{event.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-accent text-white">{event.status}</Badge>
                <Badge variant="outline" className="bg-gray-50">
                  {event.category}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="text-white bg-primary"
              onClick={onShare}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Event
            </Button>
            <Button
              size="sm"
              className="text-white bg-primary"
              onClick={handleDeleteEvent}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Event
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
