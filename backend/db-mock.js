const fs = require("fs");
const path = require("path");

const DB_FILE = "./health.db.json";

// Initialize database file
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify({
      users: [],
      health_profiles: [],
      health_records: [],
      alerts: []
    })
  );
}

function loadDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return { users: [], health_profiles: [], health_records: [], alerts: [] };
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

class MockDatabase {
  constructor() {
    this.data = loadDB();
    this.nextIds = {
      users: Math.max(...this.data.users.map(u => u.id), 0) + 1,
      health_profiles: Math.max(...this.data.health_profiles.map(p => p.id), 0) + 1,
      health_records: Math.max(...this.data.health_records.map(r => r.id), 0) + 1,
      alerts: Math.max(...this.data.alerts.map(a => a.id), 0) + 1
    };
  }

  pragma(sql) {
    // No-op for mock
  }

  exec(sql) {
    // No-op for mock - we handle schema in constructor
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        if (sql.includes("INSERT INTO users")) {
          const [name, age] = params;
          const id = self.nextIds.users++;
          const user = { id, name, age };
          self.data.users.push(user);
          saveDB(self.data);
          return { lastInsertRowid: id };
        }

        if (sql.includes("INSERT OR REPLACE INTO health_profiles")) {
          const [user_id, conditions, bp_threshold, sugar_threshold, email] = params;
          const idx = self.data.health_profiles.findIndex(p => p.user_id === user_id);
          const profile = {
            id: idx >= 0 ? self.data.health_profiles[idx].id : self.nextIds.health_profiles++,
            user_id,
            conditions,
            bp_threshold,
            sugar_threshold,
            email,
            created_at: new Date().toISOString()
          };
          if (idx >= 0) {
            self.data.health_profiles[idx] = profile;
          } else {
            self.data.health_profiles.push(profile);
          }
          saveDB(self.data);
          return { lastInsertRowid: profile.id };
        }

        if (sql.includes("INSERT INTO health_records")) {
          const [user_id, type, value] = params;
          const id = self.nextIds.health_records++;
          const record = {
            id,
            user_id,
            type,
            value,
            recorded_at: new Date().toISOString()
          };
          self.data.health_records.push(record);
          saveDB(self.data);
          return { lastInsertRowid: id };
        }

        if (sql.includes("INSERT INTO alerts")) {
          const [user_id, type, message, severity, requires_doctor_visit] = params;
          const id = self.nextIds.alerts++;
          const alert = {
            id,
            user_id,
            type,
            message,
            severity,
            requires_doctor_visit,
            created_at: new Date().toISOString()
          };
          self.data.alerts.push(alert);
          saveDB(self.data);
          return { lastInsertRowid: id };
        }

        return { lastInsertRowid: 0 };
      },

      get(...params) {
        if (sql.includes("SELECT id FROM users WHERE id")) {
          const user_id = params[0];
          return self.data.users.find(u => u.id === parseInt(user_id));
        }

        if (sql.includes("SELECT * FROM health_profiles WHERE user_id")) {
          const user_id = params[0];
          return self.data.health_profiles.find(p => p.user_id === parseInt(user_id));
        }

        return null;
      },

      all(...params) {
        if (sql.includes("SELECT * FROM health_records WHERE user_id")) {
          const user_id = params[0];
          return self.data.health_records
            .filter(r => r.user_id === parseInt(user_id))
            .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
            .slice(0, 10);
        }

        if (sql.includes("SELECT * FROM alerts WHERE user_id")) {
          const user_id = params[0];
          return self.data.alerts
            .filter(a => a.user_id === parseInt(user_id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        if (sql.includes("SELECT value, recorded_at FROM health_records")) {
          const [user_id, type, formattedDate] = params;
          return self.data.health_records
            .filter(
              r =>
                r.user_id === parseInt(user_id) &&
                r.type === type &&
                r.recorded_at.split("T")[0] >= formattedDate
            )
            .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
        }

        return [];
      }
    };
  }

  close() {
    // No-op for mock
  }
}

module.exports = function () {
  return new MockDatabase();
};
