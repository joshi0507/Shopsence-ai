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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <section className="relative w-full max-w-5xl mx-auto py-8">
      {/* Content */}
      <div className="relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
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

          <h1 className="text-4xl font-bold font-heading text-white mb-4">
            Import Your <span className="gradient-text">Sales Data</span>
          </h1>

          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Choose your preferred method to import sales data for comprehensive
            analytics
          </p>
        </motion.div>

        {/* Upload Method Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUploadMethod("csv")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
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
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
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
              className="glass-card rounded-3xl p-8 sm:p-12"
            >
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
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
              className="glass-card rounded-3xl p-8 sm:p-12 text-center"
            >
              <FileText className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Manual Data Entry
              </h3>
              <p className="text-gray-400 mb-6">
                Enter your sales data manually through our intuitive form
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glow-button px-8 py-4 rounded-xl text-base font-semibold text-void"
                disabled
              >
                Coming Soon
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DataUpload;
