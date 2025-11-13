/* eslint-disable @typescript-eslint/no-unused-vars */
// components/events/FileAttachments.tsx
import { motion } from "framer-motion";
import { FileText, Download, ExternalLink, Image, File } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import type { IAttachment } from "../../types/event.types";

interface FileAttachmentsProps {
  attachments: IAttachment[];
  eventId: string;
}

export default function FileAttachments({ attachments, eventId }: FileAttachmentsProps) {
  const getFileIcon = (filename: string, provider: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getFileSize = (url: string): string => {
    // This would typically come from your API
    return '2.4 MB';
  };

  const handleDownload = (attachment: IAttachment) => {
    // Implement download logic
    window.open(attachment.url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-lg">Files & Attachments</h3>
        </div>
        <Badge variant="secondary">{attachments?.length || 0} files</Badge>
      </div>

      <div className="space-y-3">
        {attachments?.map((attachment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {getFileIcon(attachment.filename, attachment.provider)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {attachment.filename}
                </span>
                <Badge variant="outline" className="text-xs">
                  {attachment.provider}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {getFileSize(attachment.url)}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(attachment)}
                className="h-8 w-8"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(attachment)}
                className="h-8 w-8"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}

        {(!attachments || attachments.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No files attached</p>
            <p className="text-sm mt-1">Add files to share with participants</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}