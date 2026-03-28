import { motion } from "framer-motion";
import { Users, Shield, Phone, MapPin, Clock, Bell, Send, Eye, AlertTriangle, CheckCircle, Navigation, Sparkles, UserCheck } from "lucide-react";
import LeafletMap from "@/components/LeafletMap";
import FloatingControls from "@/components/FloatingControls";

const guardians = [
  { name: "Mom", phone: "+91 98XXX XXXXX", status: "notified", avatar: "👩" },
  { name: "Best Friend", phone: "+91 97XXX XXXXX", status: "notified", avatar: "👩‍🦰" },
  { name: "Brother", phone: "+91 96XXX XXXXX", status: "pending", avatar: "👨" },
];

const timeline = [
  { time: "8:15 PM", event: "Journey started from Home", type: "safe" },
  { time: "8:22 PM", event: "Passed MG Road checkpoint", type: "safe" },
  { time: "8:28 PM", event: "Entered moderate risk zone", type: "warning" },
  { time: "8:31 PM", event: "AI rerouted to safer path", type: "safe" },
  { time: "8:35 PM", event: "Currently on Park Avenue", type: "active" },
];

const GuardianMode = () => {
  return (
    <div className="relative w-full h-full">
      <MapBackground variant="guardian" />
      <FloatingControls showSOS />

      {/* Guardian Panel */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 z-20 w-[280px]"
      >
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-semibold text-foreground">Guardian Mode</h3>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-safe/15 text-[9px] text-safe font-semibold">Active</span>
          </div>

          {/* User Status */}
          <div className="bg-safe/5 border border-safe/20 rounded-xl p-3 mb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">User is Safe</p>
              <p className="text-[10px] text-muted-foreground">Park Avenue • Last updated 30s ago</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-safe animate-pulse ml-auto" />
          </div>

          {/* Trusted Contacts */}
          <p className="text-[10px] text-muted-foreground mb-2">Trusted Contacts</p>
          <div className="space-y-2">
            {guardians.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 bg-secondary/40 rounded-xl px-3 py-2"
              >
                <span className="text-lg">{g.avatar}</span>
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-foreground">{g.name}</p>
                  <p className="text-[9px] text-muted-foreground">{g.phone}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold ${g.status === "notified" ? "bg-safe/15 text-safe" : "bg-warning/15 text-warning"}`}>
                  {g.status === "notified" ? <CheckCircle className="w-2.5 h-2.5" /> : <Bell className="w-2.5 h-2.5" />}
                  {g.status === "notified" ? "Notified" : "Pending"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Live Location Info */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute top-4 right-20 z-20 w-[200px]"
      >
        <div className="glass-panel-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-foreground">Live Location</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-1">Park Avenue, Sector 8</p>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-muted-foreground flex items-center gap-1">
              <Navigation className="w-3 h-3" /> Heading North
            </span>
            <span className="text-[9px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> 4 min to dest
            </span>
          </div>
        </div>
      </motion.div>

      {/* AI Status */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute left-4 bottom-[230px] z-20 max-w-[280px]"
      >
        <div className="glass-panel-sm p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">SafeBot:</span> All guardian contacts are tracking this journey. Live updates are being shared every 5 minutes. Emergency SOS is ready.
          </p>
        </div>
      </motion.div>

      {/* Bottom Panel */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-4 left-4 right-4 z-20"
      >
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground">Journey Timeline</span>
          </div>

          <div className="space-y-0 mb-3">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-2 py-1.5"
              >
                <span className="text-[8px] text-muted-foreground w-12 flex-shrink-0">{item.time}</span>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.type === "safe" ? "bg-safe" : item.type === "warning" ? "bg-warning" : "gradient-primary animate-pulse"}`} />
                <span className={`text-[9px] ${item.type === "active" ? "text-primary font-semibold" : "text-muted-foreground"}`}>{item.event}</span>
              </motion.div>
            ))}
          </div>

          {/* Emergency Actions */}
          <div className="flex gap-2">
            <button className="flex-1 sos-button rounded-xl py-2.5 text-xs font-semibold text-destructive-foreground flex items-center justify-center gap-2 cursor-pointer relative z-10">
              <AlertTriangle className="w-4 h-4" />
              SOS Alert
            </button>
            <button className="flex-1 bg-secondary rounded-xl py-2.5 text-xs font-medium text-foreground flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary/80 transition-colors">
              <Phone className="w-4 h-4" />
              Call User
            </button>
            <button className="flex-1 gradient-primary rounded-xl py-2.5 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
              Send Help
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GuardianMode;
