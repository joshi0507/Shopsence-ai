import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Loader2,
} from "lucide-react";
import { api, Customer } from "../lib/api";

interface CustomerListProps {
  uploadId?: string;
  segmentId: number;
  onBack: () => void;
}

const CustomerList = ({ uploadId, segmentId, onBack }: CustomerListProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [segmentName, setSegmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getSegmentCustomers(segmentId, uploadId, page);
      if (res.success && res.data) {
        setCustomers(res.data.customers);
        setSegmentName(res.data.segment_name);
        setTotalPages(res.data.pagination.total_pages);
        setTotalCount(res.data.pagination.total);
      } else {
        setError(res.error?.message || "Failed to load customers");
      }
    } catch (e) {
      setError("Network error fetching customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [segmentId, uploadId, page]);

  const filteredCustomers = searchQuery
    ? customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.customer_id?.toString().includes(searchQuery),
      )
    : customers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full glass hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {segmentName || "Segment Customers"}
            </h2>
            <p className="text-gray-400 text-sm">
              Showing {totalCount} customers in this segment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-cyan-500/50 outline-none transition-all w-full sm:w-64"
            />
          </div>
          <button className="p-2 rounded-xl glass hover:bg-white/10 text-gray-400">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
          <p className="text-gray-400">Fetching customer data...</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCustomers}
            className="glow-button px-6 py-2 rounded-xl text-void font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      RFM Score
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                      Lifetime Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCustomers.map((customer) => (
                    <motion.tr
                      key={customer.customer_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20 group-hover:scale-110 transition-transform">
                            {customer.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {customer.name ||
                                `User ${customer.customer_id.substring(0, 8)}`}
                            </div>
                            <div className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {customer.email || "No email available"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-gray-300 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            {customer.country || "Global"}
                          </div>
                          <div className="text-gray-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Active for {(customer.tenure || 0).toFixed(0)} days
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                            {customer.rfm_scores?.R}
                            {customer.rfm_scores?.F}
                            {customer.rfm_scores?.M}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer.frequency} orders
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-white font-bold">
                          $
                          {customer.monetary?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-green-400 flex items-center justify-end gap-1 mt-0.5">
                          <Tag className="w-3 h-3" />
                          Premium
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pb-10">
            <div className="text-sm text-gray-400">
              Showing page{" "}
              <span className="text-white font-medium">{page}</span> of{" "}
              <span className="text-white font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl glass hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl glass hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerList;
