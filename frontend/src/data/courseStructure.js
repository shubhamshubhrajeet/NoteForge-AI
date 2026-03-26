// MCA Complete Course Structure — All 4 Semesters
const MCA_COURSES = {
  branch: "MCA",
  fullName: "Master of Computer Applications",
  semesters: [
    {
      sem: "1st Sem",
      subjects: [
        {
          code: "CA111",
          name: "Discrete Mathematical Structure",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA112",
          name: "Operating System",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA113",
          name: "Data Structure using C",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA114",
          name: "Computer Organization and Architecture",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA115",
          name: "Universal Human Values",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA116",
          name: "Communicative English",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "2nd Sem",
      subjects: [
        {
          code: "CA121",
          name: "Linear Algebra and Numerical Optimization",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA122",
          name: "Computer Network",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA123",
          name: "Object Oriented Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA124",
          name: "Database System",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA125",
          name: "Cyber Security",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "3rd Sem",
      subjects: [
        {
          code: "CA231",
          name: "Python Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA232",
          name: "Design and Analysis of Algorithm",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA233",
          name: "AI and Machine Learning",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA234",
          name: "Internet of Things",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "4th Sem",
      subjects: [
        {
          code: "CA241",
          name: "Software Engineering",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA242",
          name: "Advanced Java Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "CA243",
          name: "Cloud Computing",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
  ],
};

// BCA placeholder (add subjects similarly when available)
const BCA_COURSES = {
  branch: "BCA",
  fullName: "Bachelor of Computer Applications",
  semesters: [
    { sem: "1st Sem", subjects: [] },
    { sem: "2nd Sem", subjects: [] },
    { sem: "3rd Sem", subjects: [] },
    { sem: "4th Sem", subjects: [] },
    { sem: "5th Sem", subjects: [] },
    { sem: "6th Sem", subjects: [] },
  ],
};

const BSCITM_COURSES = {
  branch: "BSc_ITM",
  fullName: "BSc Information Technology Management",
  semesters: [
    { sem: "1st Sem", subjects: [] },
    { sem: "2nd Sem", subjects: [] },
    { sem: "3rd Sem", subjects: [] },
    { sem: "4th Sem", subjects: [] },
    { sem: "5th Sem", subjects: [] },
    { sem: "6th Sem", subjects: [] },
  ],
};

export const ALL_COURSES = [MCA_COURSES, BCA_COURSES, BSCITM_COURSES];

export function getCoursesByBranchSem(branch, sem) {
  const b = ALL_COURSES.find((c) => c.branch === branch);
  if (!b) return [];
  const s = b.semesters.find((s) => s.sem === sem);
  return s?.subjects || [];
}

export function getSubjectByCode(code) {
  for (const b of ALL_COURSES)
    for (const s of b.semesters)
      for (const sub of s.subjects)
        if (sub.code === code) return { ...sub, branch: b.branch, sem: s.sem };
  return null;
}

export function getAllBranches() {
  return ALL_COURSES.map((c) => ({
    branch: c.branch,
    fullName: c.fullName,
    semesters: c.semesters.map((s) => s.sem),
  }));
}

export default MCA_COURSES;
