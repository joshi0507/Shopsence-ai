import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  id: string;
  backendUploadId?: string; // Store real ID from backend
}

interface DataUploadProps {
  onViewReport?: (id: string) => void;
}

const DataUpload = ({ onViewReport }: DataUploadProps) => {
  const [uploadMethod, setUploadMethod] = useState<"csv" | "manual">("csv");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualRecords, setManualRecords] = useState([
    {
      product_name: "",
      date: new Date().toISOString().split("T")[0],
      units_sold: "",
      price: "",
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addManualRow = () => {
    setManualRecords([
      ...manualRecords,
      {
        product_name: "",
        date: new Date().toISOString().split("T")[0],
        units_sold: "",
        price: "",
      },
    ]);
  };

  const removeManualRow = (index: number) => {
    if (manualRecords.length > 1) {
      setManualRecords(manualRecords.filter((_, i) => i !== index));
    }
  };

  const updateManualRecord = (index: number, field: string, value: string) => {
    const newRecords = [...manualRecords];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setManualRecords(newRecords);
  };

  const handleManualSubmit = async () => {
    // Validate records
    const validRecords = manualRecords.filter(
      (r) => r.product_name && r.date && r.units_sold && r.price,
    );

    if (validRecords.length === 0) {
      toast.error("Please fill in at least one complete record");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.manualUpload(validRecords);
      if (res.error) throw new Error(res.error.message);

      toast.success("Data processed successfully!");
      if (res.data?.upload_id && onViewReport) {
        onViewReport(res.data.upload_id);
      }
      // Reset form
      setManualRecords([
        {
          product_name: "",
          date: new Date().toISOString().split("T")[0],
          units_sold: "",
          price: "",
        },
      ]);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to process manual entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        handleFiles(files);
      }
    },
    [],
  );

  const handleFiles = async (files: File[]) => {
    const csvFiles = files.filter(
      (file) => file.name.endsWith(".csv") && file.size <= 10 * 1024 * 1024,
    );

    if (csvFiles.length === 0) {
      toast.error("Please upload valid CSV files (max 10MB)");
      return;
    }

    // Create new uploads
    const newUploads: UploadedFile[] = csvFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
      id: Math.random().toString(36).substr(2, 9),
    }));

    setUploadedFiles((prev) => [...prev, ...newUploads]);

    // Upload each file
    for (const upload of newUploads) {
      await uploadFile(upload.id, upload.file);
    }
  };

  const uploadFile = async (fileId: string, file: File) => {
    try {
      // Optimistic UI updates
      setUploadedFiles((prev) =>
        prev.map((u) => (u.id === fileId ? { ...u, progress: 30 } : u)),
      );

      const res = await api.upload(file);

      if (res.error) throw new Error(res.error.message);

      // Handle successful upload
      setUploadedFiles((prev) =>
        prev.map((u) =>
          u.id === fileId
            ? {
                ...u,
                status: "success",
                progress: 100,
                backendUploadId: res.data.upload_id, // Store the real ID
              }
            : u,
        ),
      );
      toast.success(`File ${file.name} uploaded successfully!`);
    } catch (error) {
      console.error(error);
      setUploadedFiles((prev) =>
        prev.map((u) => (u.id === fileId ? { ...u, status: "error" } : u)),
      );
      toast.error(`Upload failed for ${file.name}`);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((u) => u.id !== fileId));
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Content */}
      <div className="relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Data Upload Center</span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white mb-4">
            Import Your <span className="gradient-text">Sales Data</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-4">
            Choose your preferred method to import sales data for comprehensive
            analytics
          </p>
        </motion.div>

        {/* Upload Method Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUploadMethod("csv")}
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all min-h-[48px] sm:min-h-[52px] ${
              uploadMethod === "csv"
                ? "glow-button text-void"
                : "glass text-white border border-white/10"
            }`}
          >
            <Upload className="inline w-5 h-5 mr-2" />
            CSV Upload
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUploadMethod("manual")}
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all min-h-[48px] sm:min-h-[52px] ${
              uploadMethod === "manual"
                ? "glow-button text-void"
                : "glass text-white border border-white/10"
            }`}
          >
            <FileText className="inline w-5 h-5 mr-2" />
            Manual Entry
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {uploadMethod === "csv" ? (
            <motion.div
              key="csv"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12"
            >
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-white/20 hover:border-cyan-400/50 hover:bg-white/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <motion.div
                  animate={{
                    y: isDragging ? -10 : 0,
                    scale: isDragging ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isDragging ? "Drop your CSV file here" : "Upload CSV File"}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: 10MB
                  </p>
                </motion.div>
              </div>

              {/* Required Format Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 glass rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Required CSV Format
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      <code className="text-cyan-400">
                        product_name, date, units_sold, price
                      </code>
                    </p>
                    <p className="text-xs text-gray-500">
                      Example: iPhone 15, 2024-01-15, 150, 999.99
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Uploaded Files List */}
              <AnimatePresence>
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-3"
                  >
                    {uploadedFiles.map((upload) => (
                      <motion.div
                        key={upload.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="glass rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {upload.status === "success" && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                            {upload.status === "error" && (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            )}
                            {upload.status === "uploading" && (
                              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            )}
                            <span className="text-white font-medium">
                              {upload.file.name}
                            </span>
                          </div>

                          {/* Success Actions */}
                          {upload.status === "success" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  onViewReport?.(upload.backendUploadId || "")
                                }
                                className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-1 font-semibold"
                              >
                                View Report <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeFile(upload.id)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => removeFile(upload.id)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        {upload.status === "uploading" && (
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${upload.progress}%` }}
                              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                            />
                          </div>
                        )}
                        {upload.status === "success" && (
                          <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                            Analysis Complete. Click "View Report" to see
                            insights.
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl p-8 sm:p-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">
                    Manual Data Entry
                  </h3>
                  <p className="text-gray-400">
                    Enter your sales records individually
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-gray-400 border-b border-white/10">
                  <div className="col-span-4">Product Name</div>
                  <div className="col-span-3">Date</div>
                  <div className="col-span-2">Units</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {manualRecords.map((record, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-12 gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="e.g. iPhone 15"
                          value={record.product_name}
                          onChange={(e) =>
                            updateManualRecord(
                              index,
                              "product_name",
                              e.target.value,
                            )
                          }
                          className="w-full bg-void/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="date"
                          value={record.date}
                          onChange={(e) =>
                            updateManualRecord(index, "date", e.target.value)
                          }
                          className="w-full bg-void/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={record.units_sold}
                          onChange={(e) =>
                            updateManualRecord(
                              index,
                              "units_sold",
                              e.target.value,
                            )
                          }
                          className="w-full bg-void/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={record.price}
                          onChange={(e) =>
                            updateManualRecord(index, "price", e.target.value)
                          }
                          className="w-full bg-void/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => removeManualRow(index)}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                          disabled={manualRecords.length === 1}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={addManualRow}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors px-4 py-2"
                >
                  <span>+ Add Another Row</span>
                </button>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-white/10">
                <button
                  onClick={() =>
                    setManualRecords([
                      {
                        product_name: "",
                        date: new Date().toISOString().split("T")[0],
                        units_sold: "",
                        price: "",
                      },
                    ])
                  }
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all"
                >
                  Clear All
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManualSubmit}
                  disabled={isSubmitting}
                  className="glow-button px-8 py-2.5 rounded-xl font-bold text-void flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-void border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Process Data
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DataUpload;
