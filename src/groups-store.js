const fs = require("fs");
const path = require("path");

const groupsFilePath = path.join(process.cwd(), "groups.json");

// ==========================================
// 1. HELPER FUNCTIONS (Read & Write)
// ==========================================

function readGroupsFile() {
  try {
    if (!fs.existsSync(groupsFilePath)) {
      writeGroupsFile({ groups: [] });
    }
    const data = fs.readFileSync(groupsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error reading groups.json:", error);
    return { groups: [] }; // Return empty structure if it fails
  }
}

function writeGroupsFile(data) {
  try {
    fs.writeFileSync(groupsFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("❌ Error writing to groups.json:", error);
  }
}

// ==========================================
// 2. MAIN FUNCTIONS (Used by index.js and weekly-message.js)
// ==========================================

// Add a new group, or update it if it already exists
function upsertGroup(newGroup) {
  const data = readGroupsFile();

  const existingIndex = data.groups.findIndex(
    (g) => g.id === String(newGroup.id),
  );
  const timestamp = new Date().toISOString();

  if (existingIndex > -1) {
    data.groups[existingIndex] = {
      ...data.groups[existingIndex],
      title: newGroup.title || data.groups[existingIndex].title,
      username: newGroup.username || data.groups[existingIndex].username,
      active: true, // Reactivate it just in case it was disabled previously
      last_seen_at: timestamp,
    };
  } else {
    data.groups.push({
      id: String(newGroup.id),
      title: newGroup.title,
      username: newGroup.username || null,
      active: true,
      added_by: newGroup.addedBy || null,
      added_at: timestamp,
      last_seen_at: timestamp,
    });
  }

  writeGroupsFile(data);
}

function setGroupActive(groupId, active) {
  const data = readGroupsFile();
  const group = data.groups.find((g) => g.id === String(groupId));

  if (group) {
    group.active = active;
    group.last_seen_at = new Date().toISOString();
    writeGroupsFile(data);
  }
}

function getActiveGroups() {
  const data = readGroupsFile();
  return data.groups.filter((g) => g.active === true);
}

module.exports = {
  readGroupsFile,
  writeGroupsFile,
  upsertGroup,
  setGroupActive,
  getActiveGroups,
};
