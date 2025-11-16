import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";

interface PaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  maxVisiblePages?: number;
  previousLabel?: string;
  nextLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  pagination, 
  onPageChange, 
  className = '',
  showInfo = true,
  maxVisiblePages = 5,
  previousLabel = 'Previous',
  nextLabel = 'Next'
}) => {
  if (pagination.totalPages <= 1) return null;

  const handlePageClick = (pageNum: number) => {
    onPageChange(pageNum);
  };

  const handlePrevious = () => {
    if (pagination.hasPrev) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNext = () => {
    if (pagination.hasNext) {
      onPageChange(pagination.page + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const { page, totalPages } = pagination;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      
      // Adjust if we're at the beginning
      if (page <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if we're at the end
      if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className={`flex items-center justify-between border-t border-gray-200 pt-6 ${className}`}>
      {/* Results Info */}
      {showInfo && (
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!pagination.hasPrev}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {previousLabel}
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? handlePageClick(pageNum) : undefined}
              disabled={pageNum === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors min-w-[2.5rem] ${
                pageNum === '...'
                  ? 'text-gray-400 cursor-default'
                  : pagination.page === pageNum
                  ? "bg-blue-600 text-white border border-blue-600"
                  : "text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!pagination.hasNext}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {nextLabel}
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;