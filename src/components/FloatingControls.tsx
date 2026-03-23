import { motion } from "framer-motion";
import { LocateFixed, Layers, AlertTriangle } from "lucide-react";

const FloatingControls = ({ showSOS = false, onSOS }: { showSOS?: boolean; onSOS?: () => void }) => {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
      <motion.button
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="floating-btn"
        title="Locate me"
      >
        <LocateFixed className="w-5 h-5 text-primary" />
      </motion.button>
      <motion.button
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="floating-btn"
        title="Map layers"
      >
        <Layers className="w-5 h-5 text-foreground" />
      </motion.button>

      {showSOS && (
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onSOS}
          className="sos-button w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="SOS Emergency"
        >
          <AlertTriangle className="w-6 h-6 text-destructive-foreground relative z-10" />
        </motion.button>
      )}
    </div>
  );
};

export default FloatingControls;
