import type { IEvent } from "../../types/event.types";
import { motion } from "framer-motion";
import { Badge } from "../../components/ui/badge";

const EventDetailsContent = ({ event }: { event: IEvent }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-lg mb-3 text-gray-900">Description</h3>
        <p className="text-gray-700 leading-relaxed">{event.description}</p>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Event Type */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.25 }}
          className="bg-white rounded-xl shadow-sm border p-6 flex flex-col gap-3"
        >
          <h4 className="font-semibold text-gray-900">Event Type</h4>
          <Badge variant="success" className="w-fit">
            {event.category}
          </Badge>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.25 }}
          className="bg-white rounded-xl shadow-sm border p-6 flex flex-col gap-3"
        >
          <h4 className="font-semibold text-gray-900">Status</h4>

          <Badge
            variant={
              event.status === "published"
                ? "outline"
                : event.status === "draft"
                ? "success"
                : "warning"
            }
            className="uppercase tracking-wide w-fit"
          >
            {event.status}
          </Badge>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventDetailsContent;
