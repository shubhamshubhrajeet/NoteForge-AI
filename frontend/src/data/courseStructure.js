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
    {
      sem: "1st Sem",
      subjects: [
        {
          code: "BC111",
          name: "Environmental Science",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC112",
          name: "Digital Logic",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)112",
          name: "Digital Logic Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC113",
          name: "Programming using C",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)113",
          name: "Programming using C Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC114",
          name: "Principles of Management",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)114",
          name: "Principles of Management Tutorial",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "2nd Sem",
      subjects: [
        {
          code: "BC121",
          name: "English Communication",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC122",
          name: "Programming using C++",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)122",
          name: "Programming using C++ Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC123",
          name: "Data Structure",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)123",
          name: "Data Structure Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC124",
          name: "Statistics",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)124",
          name: "Statistics Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "3rd Sem",
      subjects: [
        {
          code: "BC231",
          name: "Computer Organization",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)231",
          name: "Computer Organization Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC232",
          name: "Java Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)232",
          name: "Java Programming Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC233",
          name: "Discrete Mathematical Structures",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)233",
          name: "Discrete Mathematical Structures Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC234",
          name: "Python Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC235",
          name: "Business Accounting",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)235",
          name: "Business Accounting Tutorial",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "4th Sem",
      subjects: [
        {
          code: "BC241",
          name: "Operating System",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)241",
          name: "Operating System Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC242",
          name: "Computer Networks",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)242",
          name: "Computer Networks Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC243",
          name: "Database Systems",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)243",
          name: "Database Systems Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC244",
          name: "Android Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC245",
          name: "Business Economics",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)245",
          name: "Business Economics Tutorial",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "5th Sem",
      subjects: [
        {
          code: "BC351",
          name: "Web Technology",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)351",
          name: "Web Technology Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC352",
          name: "Software Engineering",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)352",
          name: "Software Engineering Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC353",
          name: "Unix Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)353",
          name: "Unix Programming Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC354",
          name: "Data Mining",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)354",
          name: "Data Mining Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "6th Sem",
      subjects: [
        {
          code: "BC361",
          name: "Computer Graphics",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)361",
          name: "Computer Graphics Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC362",
          name: "Numerical Techniques",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)362",
          name: "Numerical Techniques Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC363",
          name: "Data Science",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)363",
          name: "Data Science Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC364",
          name: "E-Commerce",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "BC(P)364",
          name: "E-Commerce Tutorial",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
  ],
};

const BSCITM_COURSES = {
  branch: "BSc_ITM",
  fullName: "BSc Information Technology Management",
  semesters: [
    {
      sem: "1st Sem",
      subjects: [
        {
          code: "TM111",
          name: "Environmental Studies",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM112",
          name: "Computer Fundamental for Management",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM113",
          name: "Programming in C",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM114",
          name: "Discrete Mathematics",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM115",
          name: "Universal Human Values",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)112",
          name: "Computer Fundamental for Management Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)113",
          name: "Programming in C Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "2nd Sem",
      subjects: [
        {
          code: "TM121",
          name: "Communicative English",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM122",
          name: "Computer Organization and Architecture",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM123",
          name: "Data Structure through C",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM124",
          name: "Numerical Techniques",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)122",
          name: "Computer Organization and Architecture Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)123",
          name: "Data Structure through C Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)125",
          name: "Soft Skill Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "3rd Sem",
      subjects: [
        {
          code: "TM231",
          name: "Object Oriented Programming using C++",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM232",
          name: "Database System",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM233",
          name: "Statistical Techniques",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM234",
          name: "Principles of Management",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM235",
          name: "Python Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)231",
          name: "Object Oriented Programming Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)232",
          name: "Database System Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "4th Sem",
      subjects: [
        {
          code: "TM241",
          name: "Java Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM242",
          name: "Operating System",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM243",
          name: "Computer Networking",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM244",
          name: "Management Information System",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM245",
          name: "Android Programming",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)241",
          name: "Java Programming Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)245",
          name: "Android Programming Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "5th Sem",
      subjects: [
        {
          code: "TM351",
          name: "Web Technology",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM352",
          name: "Software Engineering",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM353",
          name: "Data Mining",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM354",
          name: "E-Commerce",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)351",
          name: "Web Technology Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)352",
          name: "Software Engineering Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
    {
      sem: "6th Sem",
      subjects: [
        {
          code: "TM361",
          name: "Computer Network",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM362",
          name: "Cyber Security",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM363",
          name: "Internet of Things",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM364",
          name: "Project",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
        {
          code: "TM(P)361",
          name: "Computer Network Lab",
          units: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
        },
      ],
    },
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
