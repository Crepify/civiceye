export const CAMPUS_FLOORS = {
  "_note": "FLOOR PLANS FULLY FIXED FROM YOUR A BLOCK 1ST FLOOR PHOTOS + E BLOCK SQUARE CORRECTION + GOOGLE MAPS REF + 15 WEB IMAGES + AMRITAPURI PDF. A Block 1st floor: open corridor south with railings facing fountain/white building, rooms north with wooden doors, Akshaya Hall sign, Indo-US blue curved wall with Indian/US flags, Amma photo, staircase Amma photo, ARISTO bin, notice boards. E Block square 50.8x50.8m per your correction, all halls in 1st 2nd 3rd floor (Amriteshwari 265, Sudhamani 300, Krishna 112 on 1st, Vyasa 90, Rama 85, Valmiki 80, Conference 27 on 2nd, Indo-US 62, E-Learning 120, Akshaya 100 on 3rd), library 4th floor only. Still estimated: exact room numbers, desk positions need surveyed data.",
  "buildings": {
    "a": {
      "name": "Block A",
      "verified": false,
      "floors": [
        {
          "id": "a-g",
          "name": "Ground Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 285,
              "y": 390
            },
            {
              "id": "n2",
              "x": 500,
              "y": 390
            },
            {
              "id": "n3",
              "x": 715,
              "y": 390
            },
            {
              "id": "n4",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ]
          ],
          "spaces": [
            {
              "id": "d-a-g-0",
              "type": "admin",
              "label": "A-G1",
              "name": "Examination Office",
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "d-a-g-1",
              "type": "admin",
              "label": "A-G2",
              "name": "Accounts Office",
              "shape": "rect",
              "x": 218,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "d-a-g-2",
              "type": "amenity",
              "label": "Sudhamani",
              "name": "Sudhamani Hall",
              "capacity": 300,
              "shape": "rect",
              "x": 411,
              "y": 26,
              "w": 350,
              "h": 180,
              "node": "n2",
              "meta": {
                "Use": "Seminars, placement, club activities",
                "Source": "amrita.edu ICTS",
                "RealCapacity": "300 seats (verified from amrita.edu ICTS)",
                "InferredFrom": "Your photos + Google Maps + ICTS + window count ~6m/room"
              }
            },
            {
              "id": "d-a-g-3",
              "type": "classroom",
              "label": "A-G4",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 603,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "d-a-g-4",
              "type": "classroom",
              "label": "A-G5",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 796,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n4"
            },
            {
              "id": "d-a-g-5",
              "type": "admin",
              "label": "A-G6",
              "name": "Training & Placement Cell",
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "d-a-g-6",
              "type": "office",
              "label": "A-G7",
              "name": "EEE Faculty Room 1",
              "shape": "rect",
              "x": 218,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n1",
              "seats": [
                {
                  "id": "d-a-g-D-G7-0",
                  "x": 239,
                  "y": 248,
                  "desk": "A-G7-01",
                  "person": "Dr. J. Ramprabhakar",
                  "role": "Vice Chairperson",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/j-ramprabhakar",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-1",
                  "x": 273,
                  "y": 248,
                  "desk": "A-G7-02",
                  "person": "Dr. K. Deepa",
                  "role": "Professor",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/k-deepa",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-2",
                  "x": 307,
                  "y": 248,
                  "desk": "A-G7-03",
                  "person": "Dr. Rashmi M. R.",
                  "role": "Professor",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/rashmi-m-r",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-3",
                  "x": 341,
                  "y": 248,
                  "desk": "A-G7-04",
                  "person": "Dr. Vidya H. A.",
                  "role": "Chairperson",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/vidya-h-a",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-4",
                  "x": 375,
                  "y": 248,
                  "desk": "A-G7-05",
                  "person": "Dr. M. Nithya",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/m-nithya",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-5",
                  "x": 239,
                  "y": 284,
                  "desk": "A-G7-06",
                  "person": "Dr. Manitha P. V.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/manitha-p-v",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-6",
                  "x": 273,
                  "y": 284,
                  "desk": "A-G7-07",
                  "person": "Dr. Mini Sujith",
                  "role": "Associate Professor",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/mini-sujith",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-7",
                  "x": 307,
                  "y": 284,
                  "desk": "A-G7-08",
                  "person": "Dr. Sujit Kumar",
                  "role": "Assistant Professor",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/sujit-kumar",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-D-G7-8",
                  "x": 341,
                  "y": 284,
                  "desk": "A-G7-09",
                  "person": "Dr. Surekha P.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/surekha-p",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "EEE",
                "Faculty": "9 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "d-a-g-7",
              "type": "classroom",
              "label": "A-G8",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 411,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "d-a-g-8",
              "type": "support",
              "label": "A-G9",
              "name": "Utility",
              "shape": "rect",
              "x": 603,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n3",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "d-a-g-9",
              "type": "support",
              "label": "A-G10",
              "name": "Store",
              "shape": "rect",
              "x": 796,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n4"
            },
            {
              "id": "d-a-g-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n2",
              "linksTo": "a-1"
            },
            {
              "id": "d-a-g-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n4"
            },
            {
              "id": "d-a-g-ent",
              "type": "entrance",
              "label": "Entrance",
              "name": "Block A Entrance",
              "shape": "rect",
              "x": 90,
              "y": 365,
              "w": 110,
              "h": 46,
              "node": "n0"
            },
            {
              "id": "d-a-g-11",
              "type": "office",
              "label": "A-G11",
              "name": "CSE/AIE Faculty Room (Overflow)",
              "shape": "rect",
              "x": 796,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n4",
              "seats": [
                {
                  "id": "d-a-g-CSE-11-0",
                  "x": 817,
                  "y": 248,
                  "desk": "A-G11-01",
                  "person": "Divya K V",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/divya-k-v/",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-CSE-11-1",
                  "x": 847,
                  "y": 248,
                  "desk": "A-G11-02",
                  "person": "Pooja Gowda",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/pooja-gowda/",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-CSE-11-2",
                  "x": 877,
                  "y": 248,
                  "desk": "A-G11-03",
                  "person": "Shalini Tiwari",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/shalini-tiwari/",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-CSE-11-3",
                  "x": 817,
                  "y": 284,
                  "desk": "A-G11-04",
                  "person": "Neera Chaudhary",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/neera-chaudhary/",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-CSE-11-4",
                  "x": 847,
                  "y": 284,
                  "desk": "A-G11-05",
                  "person": "Arya Suresh",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/arya-suresh/",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-g-CSE-11-5",
                  "x": 877,
                  "y": 284,
                  "desk": "A-G11-06",
                  "person": "Penki Lavanya",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/p-lavanya/",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "CSE",
                "Faculty": "6 listed",
                "Source": "amrita.edu + enhanced"
              }
            }
          ]
        },
        {
          "id": "a-1",
          "name": "First Floor \u2014 ACCURATE from your photos: open corridor south with railings facing fountain, rooms north, Akshaya Hall, Indo-US blue curved wall",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 285,
              "y": 390
            },
            {
              "id": "n2",
              "x": 500,
              "y": 390
            },
            {
              "id": "n3",
              "x": 715,
              "y": 390
            },
            {
              "id": "n4",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ]
          ],
          "spaces": [
            {
              "id": "d-a-1-0",
              "type": "lab",
              "label": "A-101",
              "name": "Computer Centre (24/7)",
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 180,
              "h": 130,
              "node": "n0",
              "capacity": 80,
              "meta": {
                "Corridor": "Open south with railings facing fountain per your photo",
                "Facing": "North side, wooden door"
              }
            },
            {
              "id": "d-a-1-1",
              "type": "lab",
              "label": "A-102",
              "name": "Internet Lab (50 nodes, real)",
              "shape": "rect",
              "x": 220,
              "y": 26,
              "w": 180,
              "h": 130,
              "node": "n1",
              "capacity": 50,
              "meta": {
                "Source": "amrita.edu ICTS",
                "Facing": "North side"
              }
            },
            {
              "id": "d-a-1-2",
              "type": "admin",
              "label": "A-103",
              "name": "ICTS / NOC",
              "shape": "rect",
              "x": 414,
              "y": 26,
              "w": 180,
              "h": 130,
              "node": "n2",
              "meta": {
                "Facing": "North side"
              }
            },
            {
              "id": "d-a-1-3",
              "type": "amenity",
              "label": "Akshaya",
              "name": "Akshaya Hall (from your photo)",
              "shape": "rect",
              "x": 608,
              "y": 26,
              "w": 200,
              "h": 130,
              "node": "n3",
              "capacity": 100,
              "meta": {
                "Source": "Your photo AKSHAYA HALL sign",
                "Facing": "North side"
              }
            },
            {
              "id": "d-a-1-4",
              "type": "amenity",
              "label": "Indo-US",
              "name": "Indo-US Initiatives (blue curved wall)",
              "shape": "rect",
              "x": 822,
              "y": 26,
              "w": 150,
              "h": 130,
              "node": "n4",
              "capacity": 62,
              "meta": {
                "Note": "Blue curved wall Indian flag US flag Amma photo from your photo",
                "Facing": "North side blue wall"
              }
            },
            {
              "id": "d-a-1-5",
              "type": "office",
              "label": "A-106",
              "name": "EEE Faculty Room 2",
              "shape": "rect",
              "x": 26,
              "y": 170,
              "w": 180,
              "h": 130,
              "node": "n0",
              "meta": {
                "Department": "EEE"
              },
              "seats": [
                {
                  "id": "d-a-1-D-106-0",
                  "x": 50,
                  "y": 220,
                  "desk": "A-106-01",
                  "person": "Dr. Syama S.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/s-syama",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-1-D-106-1",
                  "x": 90,
                  "y": 220,
                  "desk": "A-106-02",
                  "person": "Dr. V. S. Kirthika Devi",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/s-kirthika",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-1-D-106-2",
                  "x": 130,
                  "y": 220,
                  "desk": "A-106-03",
                  "person": "K. Sireesha",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/k-sireesha",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-1-D-106-3",
                  "x": 170,
                  "y": 220,
                  "desk": "A-106-04",
                  "person": "K. Vishnu Raj",
                  "role": "Assistant Professor (OC)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/k-vishnu-raj",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-1-D-106-4",
                  "x": 50,
                  "y": 260,
                  "desk": "A-106-05",
                  "person": "Kruthika U.",
                  "role": "Assistant Professor (OC)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/kruthika-u",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-1-D-106-5",
                  "x": 90,
                  "y": 260,
                  "desk": "A-106-06",
                  "person": "Lekshmi S.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/s-lekshmi",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-1-D-106-6",
                  "x": 130,
                  "y": 260,
                  "desk": "A-106-07",
                  "person": "Sudha Yadav",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/sy-sudha",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-1-D-106-7",
                  "x": 170,
                  "y": 260,
                  "desk": "A-106-08",
                  "person": "V. Sailaja",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "EEE",
                  "url": "https://www.amrita.edu/faculty/v-sailaja",
                  "hours": "\u2014"
                }
              ]
            },
            {
              "id": "d-a-1-6",
              "type": "classroom",
              "label": "A-107",
              "name": "Classroom (80, wooden door)",
              "shape": "rect",
              "x": 220,
              "y": 170,
              "w": 180,
              "h": 130,
              "node": "n1",
              "capacity": 80,
              "meta": {
                "Note": "Wooden door from your photo",
                "Facing": "North side"
              }
            },
            {
              "id": "d-a-1-7",
              "type": "classroom",
              "label": "A-108",
              "name": "Classroom (80)",
              "shape": "rect",
              "x": 414,
              "y": 170,
              "w": 180,
              "h": 130,
              "node": "n2",
              "capacity": 80,
              "meta": {
                "Facing": "North side"
              }
            },
            {
              "id": "d-a-1-8",
              "type": "support",
              "label": "A-109",
              "name": "Drinking Water + Notice Boards",
              "shape": "rect",
              "x": 608,
              "y": 170,
              "w": 180,
              "h": 130,
              "node": "n3",
              "meta": {
                "Note": "Water every floor, notice boards brown framed, blue ARISTO bin, fire extinguisher, CCTV from your photos"
              }
            },
            {
              "id": "d-a-1-9",
              "type": "amenity",
              "label": "A-110",
              "name": "E-Learning Studio 120",
              "shape": "rect",
              "x": 802,
              "y": 170,
              "w": 170,
              "h": 130,
              "node": "n4",
              "capacity": 120,
              "meta": {
                "Source": "amrita.edu ICTS"
              }
            },
            {
              "id": "d-a-1-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase with Amma photo",
              "shape": "rect",
              "x": 465,
              "y": 330,
              "w": 70,
              "h": 50,
              "node": "n2",
              "meta": {
                "Note": "Staircase Amma photo wooden handrail red white railing grey tiles from your photo"
              }
            },
            {
              "id": "d-a-1-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 330,
              "w": 66,
              "h": 50,
              "node": "n5"
            }
          ]
        },
        {
          "id": "a-2",
          "name": "Second Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 285,
              "y": 390
            },
            {
              "id": "n2",
              "x": 500,
              "y": 390
            },
            {
              "id": "n3",
              "x": 715,
              "y": 390
            },
            {
              "id": "n4",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ]
          ],
          "spaces": [
            {
              "id": "d-a-2-0",
              "type": "classroom",
              "label": "A-201",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "d-a-2-1",
              "type": "classroom",
              "label": "A-202",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 218,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "d-a-2-2",
              "type": "lab",
              "label": "A-203",
              "name": "Research Lab",
              "capacity": 30,
              "shape": "rect",
              "x": 411,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "d-a-2-3",
              "type": "office",
              "label": "A-204",
              "name": "ECE Faculty Room 4",
              "shape": "rect",
              "x": 603,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n3",
              "seats": [
                {
                  "id": "d-a-2-D-204-0",
                  "x": 624,
                  "y": 97,
                  "desk": "A-204-01",
                  "person": "Dr. Vivek Venugopal",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/vivekvenugopal",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-1",
                  "x": 658,
                  "y": 97,
                  "desk": "A-204-02",
                  "person": "Gayathri R.",
                  "role": "Assistant Professor (OC)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/gayathri-r",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-2",
                  "x": 692,
                  "y": 97,
                  "desk": "A-204-03",
                  "person": "Giriraja C. V.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/cv-giriraja",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-3",
                  "x": 726,
                  "y": 97,
                  "desk": "A-204-04",
                  "person": "Jayashree M. Oli",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/jayashree-m",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-4",
                  "x": 760,
                  "y": 97,
                  "desk": "A-204-05",
                  "person": "Kirti S. Pande",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/sp-kirti",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-5",
                  "x": 624,
                  "y": 133,
                  "desk": "A-204-06",
                  "person": "Priya B. K.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/bk-priya",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-6",
                  "x": 658,
                  "y": 133,
                  "desk": "A-204-07",
                  "person": "Sagar B.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/b-sagar",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-7",
                  "x": 692,
                  "y": 133,
                  "desk": "A-204-08",
                  "person": "Sonali Agrawal",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/a-sonali",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-8",
                  "x": 726,
                  "y": 133,
                  "desk": "A-204-09",
                  "person": "Swaminadhan Rajula",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/r-swaminadhan",
                  "hours": "\u2014"
                },
                {
                  "id": "d-a-2-D-204-9",
                  "x": 760,
                  "y": 133,
                  "desk": "A-204-10",
                  "person": "Vignesh V.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/v-vignesh",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "ECE",
                "Faculty": "10 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "d-a-2-4",
              "type": "office",
              "label": "A-205",
              "name": "HoD Office \u2014 ECE",
              "shape": "rect",
              "x": 796,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n4"
            },
            {
              "id": "d-a-2-5",
              "type": "classroom",
              "label": "A-206",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "d-a-2-6",
              "type": "classroom",
              "label": "A-207",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 218,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "d-a-2-7",
              "type": "lab",
              "label": "A-208",
              "name": "Project Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 411,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "d-a-2-8",
              "type": "support",
              "label": "A-209",
              "name": "Utility",
              "shape": "rect",
              "x": 603,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n3",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "d-a-2-9",
              "type": "support",
              "label": "A-210",
              "name": "Store",
              "shape": "rect",
              "x": 796,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n4"
            },
            {
              "id": "d-a-2-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n2",
              "linksTo": "a-1"
            },
            {
              "id": "d-a-2-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n4"
            }
          ]
        }
      ]
    },
    "b": {
      "name": "Block B",
      "verified": false,
      "floors": [
        {
          "id": "b-g",
          "name": "Ground Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 285,
              "y": 390
            },
            {
              "id": "n2",
              "x": 500,
              "y": 390
            },
            {
              "id": "n3",
              "x": 715,
              "y": 390
            },
            {
              "id": "n4",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ]
          ],
          "spaces": [
            {
              "id": "c-b-g-0",
              "type": "lab",
              "label": "B-G1",
              "name": "Electronics Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "c-b-g-1",
              "type": "lab",
              "label": "B-G2",
              "name": "Microprocessor Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 218,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "c-b-g-2",
              "type": "lab",
              "label": "B-G3",
              "name": "Communication Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 411,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "c-b-g-3",
              "type": "classroom",
              "label": "B-G4",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 603,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "c-b-g-4",
              "type": "classroom",
              "label": "B-G5",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 796,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n4"
            },
            {
              "id": "c-b-g-5",
              "type": "amenity",
              "label": "Krishna",
              "name": "Krishna Hall",
              "capacity": 112,
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 250,
              "h": 160,
              "node": "n0",
              "meta": {
                "Use": "Seminars, student presentations",
                "Source": "amrita.edu ICTS",
                "RealCapacity": "112 seats (verified from amrita.edu ICTS)",
                "InferredFrom": "Your photos + Google Maps + ICTS + window count ~6m/room"
              }
            },
            {
              "id": "c-b-g-6",
              "type": "office",
              "label": "B-G7",
              "name": "ECE Faculty Room 1",
              "shape": "rect",
              "x": 218,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n1",
              "seats": [
                {
                  "id": "c-b-g-C-G7-0",
                  "x": 239,
                  "y": 248,
                  "desk": "B-G7-01",
                  "person": "Dr. M. Vinodhini",
                  "role": "Vice Chairperson",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/m-vinodhini",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-1",
                  "x": 273,
                  "y": 248,
                  "desk": "B-G7-02",
                  "person": "Dr. Navin Kumar",
                  "role": "Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/k-navin",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-2",
                  "x": 307,
                  "y": 248,
                  "desk": "B-G7-03",
                  "person": "Dr. T. K. Ramesh",
                  "role": "Chairperson",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/tk-ramesh",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-3",
                  "x": 341,
                  "y": 248,
                  "desk": "B-G7-04",
                  "person": "Late Dr. Dhanesh G. Kurup (Memorial Page)",
                  "role": "Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/dg-kurup",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-4",
                  "x": 375,
                  "y": 248,
                  "desk": "B-G7-05",
                  "person": "Dr. Anusaya Swain",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/anusaya-swain",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-5",
                  "x": 239,
                  "y": 284,
                  "desk": "B-G7-06",
                  "person": "Dr. Ashish Goswami",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/ashish-goswami",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-6",
                  "x": 273,
                  "y": 284,
                  "desk": "B-G7-07",
                  "person": "Dr. Bhavana V.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/v-bhavana",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-7",
                  "x": 307,
                  "y": 284,
                  "desk": "B-G7-08",
                  "person": "Dr. Chinthala Ramesh",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/c-ramesh",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-8",
                  "x": 341,
                  "y": 284,
                  "desk": "B-G7-09",
                  "person": "Dr. Ganapathi Hegde",
                  "role": "Associate Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/ganapathi-hedge",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-C-G7-9",
                  "x": 375,
                  "y": 284,
                  "desk": "B-G7-10",
                  "person": "Dr. Harshit Srivastava",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/harshit-srivastava",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "ECE",
                "Faculty": "10 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "c-b-g-7",
              "type": "classroom",
              "label": "B-G8",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 411,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "c-b-g-8",
              "type": "support",
              "label": "B-G9",
              "name": "Lab Store",
              "shape": "rect",
              "x": 603,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "c-b-g-9",
              "type": "support",
              "label": "B-G10",
              "name": "Utility",
              "shape": "rect",
              "x": 796,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n4",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "c-b-g-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n2",
              "linksTo": "b-1"
            },
            {
              "id": "c-b-g-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n4"
            },
            {
              "id": "c-b-g-ent",
              "type": "entrance",
              "label": "Entrance",
              "name": "Block B Entrance",
              "shape": "rect",
              "x": 90,
              "y": 365,
              "w": 110,
              "h": 46,
              "node": "n0"
            },
            {
              "id": "c-b-g-11",
              "type": "office",
              "label": "B-G11",
              "name": "CSE Faculty Room 1",
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n0",
              "seats": [
                {
                  "id": "c-b-g-CSE-G11-0",
                  "x": 47,
                  "y": 248,
                  "desk": "B-G11-01",
                  "person": "Dr. Vineetha Jain K. V.",
                  "role": "Vice Chairperson, Assistant Professor (Sl. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/jain-vineetha/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-1",
                  "x": 81,
                  "y": 248,
                  "desk": "B-G11-02",
                  "person": "Dr. Sreevidya B.",
                  "role": "Vice Chairperson, Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/b-sreevidya/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-2",
                  "x": 115,
                  "y": 248,
                  "desk": "B-G11-03",
                  "person": "Dr. Peeta Basa Pati",
                  "role": "Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/peeta-pati/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-3",
                  "x": 149,
                  "y": 248,
                  "desk": "B-G11-04",
                  "person": "Dr. Amudha J.",
                  "role": "Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/j-amudha/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-4",
                  "x": 183,
                  "y": 248,
                  "desk": "B-G11-05",
                  "person": "Dr. Deepa Gupta",
                  "role": "Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/dr-deepa-gupta/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-5",
                  "x": 47,
                  "y": 284,
                  "desk": "B-G11-06",
                  "person": "Dr. Supriya M.",
                  "role": "Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/m-supriya/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-6",
                  "x": 81,
                  "y": 284,
                  "desk": "B-G11-07",
                  "person": "Dr. Suja P.",
                  "role": "Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/p-suja/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-7",
                  "x": 115,
                  "y": 284,
                  "desk": "B-G11-08",
                  "person": "Dr. Beena B. M.",
                  "role": "Associate Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/beena-bm/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-8",
                  "x": 149,
                  "y": 284,
                  "desk": "B-G11-09",
                  "person": "Dr. Manju Khanna",
                  "role": "Associate Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/manju-khanna/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-g-CSE-G11-9",
                  "x": 183,
                  "y": 284,
                  "desk": "B-G11-10",
                  "person": "Dr. Tripty Singh",
                  "role": "Associate Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/tripty-singh/",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "CSE",
                "Faculty": "46 listed",
                "Source": "amrita.edu + enhanced from images"
              }
            }
          ]
        },
        {
          "id": "b-1",
          "name": "First Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 285,
              "y": 390
            },
            {
              "id": "n2",
              "x": 500,
              "y": 390
            },
            {
              "id": "n3",
              "x": 715,
              "y": 390
            },
            {
              "id": "n4",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ]
          ],
          "spaces": [
            {
              "id": "c-b-1-0",
              "type": "lab",
              "label": "B-101",
              "name": "Computer Lab 3",
              "capacity": 60,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "c-b-1-1",
              "type": "lab",
              "label": "B-102",
              "name": "AI / ML Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 218,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "c-b-1-2",
              "type": "lab",
              "label": "B-103",
              "name": "Networks Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 411,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "c-b-1-3",
              "type": "classroom",
              "label": "B-104",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 603,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "c-b-1-4",
              "type": "classroom",
              "label": "B-105",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 796,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n4"
            },
            {
              "id": "c-b-1-5",
              "type": "office",
              "label": "B-106",
              "name": "ECE Faculty Room 2",
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n0",
              "seats": [
                {
                  "id": "c-b-1-C-106-0",
                  "x": 47,
                  "y": 248,
                  "desk": "B-106-01",
                  "person": "Dr. Jitendra Bahadur",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/jitendra-bahadur",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-1",
                  "x": 81,
                  "y": 248,
                  "desk": "B-106-02",
                  "person": "Dr. Karnena Rohit Kumar",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/karnena-rohit-kumar",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-2",
                  "x": 115,
                  "y": 248,
                  "desk": "B-106-03",
                  "person": "Dr. Kaveri Hatti",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/kaveri-hatti",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-3",
                  "x": 149,
                  "y": 248,
                  "desk": "B-106-04",
                  "person": "Dr. Manoj Kumar Panda",
                  "role": "Associate Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/manoj-kumar-panda",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-4",
                  "x": 183,
                  "y": 248,
                  "desk": "B-106-05",
                  "person": "Dr. Nizampatnam Neelima",
                  "role": "Associate Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/n-neelima",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-5",
                  "x": 47,
                  "y": 284,
                  "desk": "B-106-06",
                  "person": "Dr. Paramasivam C.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/c-paramasivam",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-6",
                  "x": 81,
                  "y": 284,
                  "desk": "B-106-07",
                  "person": "Dr. Parul Mathur",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/p-mathur",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-7",
                  "x": 115,
                  "y": 284,
                  "desk": "B-106-08",
                  "person": "Dr. Patthi Aruna",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/patthi-aruna",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-8",
                  "x": 149,
                  "y": 284,
                  "desk": "B-106-09",
                  "person": "Dr. Phani Raj Harivanam",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/phani-raj-harivanam",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-C-106-9",
                  "x": 183,
                  "y": 284,
                  "desk": "B-106-10",
                  "person": "Dr. Priti Mandal",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/priti-mandal",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "ECE",
                "Faculty": "10 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "c-b-1-6",
              "type": "office",
              "label": "B-107",
              "name": "HoD Office \u2014 CSE",
              "shape": "rect",
              "x": 218,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "c-b-1-7",
              "type": "classroom",
              "label": "B-108",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 411,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "c-b-1-8",
              "type": "amenity",
              "label": "Indo-US",
              "name": "Indo-US Corporate Classroom",
              "capacity": 62,
              "shape": "rect",
              "x": 603,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n3",
              "meta": {
                "Use": "Dual MS-degree lecture studio",
                "Source": "amrita.edu ICTS"
              }
            },
            {
              "id": "c-b-1-9",
              "type": "support",
              "label": "B-110",
              "name": "Utility",
              "shape": "rect",
              "x": 796,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n4",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "c-b-1-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n2",
              "linksTo": "b-2"
            },
            {
              "id": "c-b-1-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n4"
            },
            {
              "id": "c-b-1-11",
              "type": "office",
              "label": "B-111",
              "name": "CSE Faculty Room 2",
              "shape": "rect",
              "x": 796,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n4",
              "seats": [
                {
                  "id": "c-b-1-CSE-111-0",
                  "x": 817,
                  "y": 248,
                  "desk": "B-111-01",
                  "person": "Dr. B. Uma Maheswari",
                  "role": "Associate Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/b-uma/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-1",
                  "x": 851,
                  "y": 248,
                  "desk": "B-111-02",
                  "person": "Dr. Thangam S",
                  "role": "Associate Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/s-thangam/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-2",
                  "x": 885,
                  "y": 248,
                  "desk": "B-111-03",
                  "person": "Dr. S. Santhanalakshmi",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/s-lakshmi/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-3",
                  "x": 919,
                  "y": 248,
                  "desk": "B-111-04",
                  "person": "Dr. Manju Venugopalan",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/manju-venugopalan/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-4",
                  "x": 953,
                  "y": 248,
                  "desk": "B-111-05",
                  "person": "Dr. Kumaran U.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/kumaran-u/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-5",
                  "x": 817,
                  "y": 284,
                  "desk": "B-111-06",
                  "person": "Dr. Radha D.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/d-radha/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-6",
                  "x": 851,
                  "y": 284,
                  "desk": "B-111-07",
                  "person": "Dr. Rimjhim Singh",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/dr-rimjhim-singh/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-7",
                  "x": 885,
                  "y": 284,
                  "desk": "B-111-08",
                  "person": "Dr. Meena Belwal",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/b-meena/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-8",
                  "x": 919,
                  "y": 284,
                  "desk": "B-111-09",
                  "person": "Dr. K Dinesh Kumar",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/dr-k-dinesh-kumar/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-1-CSE-111-9",
                  "x": 953,
                  "y": 284,
                  "desk": "B-111-10",
                  "person": "Dr. Gurupriya M.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/gurupriya-m/",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "CSE",
                "Faculty": "10 listed",
                "Source": "amrita.edu"
              }
            }
          ]
        },
        {
          "id": "b-2",
          "name": "Second Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 285,
              "y": 390
            },
            {
              "id": "n2",
              "x": 500,
              "y": 390
            },
            {
              "id": "n3",
              "x": 715,
              "y": 390
            },
            {
              "id": "n4",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ]
          ],
          "spaces": [
            {
              "id": "c-b-2-0",
              "type": "classroom",
              "label": "B-201",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "c-b-2-1",
              "type": "classroom",
              "label": "B-202",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 218,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "c-b-2-2",
              "type": "lab",
              "label": "B-203",
              "name": "Research Lab",
              "capacity": 30,
              "shape": "rect",
              "x": 411,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "c-b-2-3",
              "type": "lab",
              "label": "B-204",
              "name": "Research Lab",
              "capacity": 30,
              "shape": "rect",
              "x": 603,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "c-b-2-4",
              "type": "office",
              "label": "B-205",
              "name": "ECE Faculty Room 3",
              "shape": "rect",
              "x": 796,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n4",
              "seats": [
                {
                  "id": "c-b-2-C-205-0",
                  "x": 817,
                  "y": 97,
                  "desk": "B-205-01",
                  "person": "Dr. R. V. Sanjika Devi",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/r-sanjika",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-1",
                  "x": 851,
                  "y": 97,
                  "desk": "B-205-02",
                  "person": "Dr. S. Lalitha",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/s-lalitha",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-2",
                  "x": 885,
                  "y": 97,
                  "desk": "B-205-03",
                  "person": "Dr. Sarda Sharma",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/dr-sarada-sharma",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-3",
                  "x": 919,
                  "y": 97,
                  "desk": "B-205-04",
                  "person": "Dr. Shivalila Hangaragi",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/shivalila-hangaragi",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-4",
                  "x": 953,
                  "y": 97,
                  "desk": "B-205-05",
                  "person": "Dr. Sreeja Kochuvila",
                  "role": "Associate Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/k-sreeja",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-5",
                  "x": 817,
                  "y": 133,
                  "desk": "B-205-06",
                  "person": "Dr. Sumathi S",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/sumathi-s",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-6",
                  "x": 851,
                  "y": 133,
                  "desk": "B-205-07",
                  "person": "Dr. Sunitha R.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/r-sunitha",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-7",
                  "x": 885,
                  "y": 133,
                  "desk": "B-205-08",
                  "person": "Dr. Sushant Shendre",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/sushant-shendre",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-8",
                  "x": 919,
                  "y": 133,
                  "desk": "B-205-09",
                  "person": "Dr. Sushma B.",
                  "role": "Assistant Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/sushma-b",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-C-205-9",
                  "x": 953,
                  "y": 133,
                  "desk": "B-205-10",
                  "person": "Dr. Susmitha Vekkot",
                  "role": "Associate Professor",
                  "dept": "ECE",
                  "url": "https://www.amrita.edu/faculty/susmitha-vekkot",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "ECE",
                "Faculty": "10 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "c-b-2-5",
              "type": "classroom",
              "label": "B-206",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "c-b-2-6",
              "type": "classroom",
              "label": "B-207",
              "name": "Tutorial Room",
              "capacity": 40,
              "shape": "rect",
              "x": 218,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "c-b-2-7",
              "type": "support",
              "label": "B-208",
              "name": "Utility",
              "shape": "rect",
              "x": 411,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n2",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "c-b-2-8",
              "type": "support",
              "label": "B-209",
              "name": "Store",
              "shape": "rect",
              "x": 603,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "c-b-2-9",
              "type": "support",
              "label": "B-210",
              "name": "Utility",
              "shape": "rect",
              "x": 796,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n4",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "c-b-2-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n2",
              "linksTo": "b-1"
            },
            {
              "id": "c-b-2-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n4"
            },
            {
              "id": "c-b-2-11",
              "type": "office",
              "label": "B-211",
              "name": "CSE Faculty Room 3 + AIE",
              "shape": "rect",
              "x": 411,
              "y": 177,
              "w": 178,
              "h": 137,
              "node": "n2",
              "seats": [
                {
                  "id": "c-b-2-CSE-211-0",
                  "x": 432,
                  "y": 248,
                  "desk": "B-211-01",
                  "person": "Dr. Vishwas H. N.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/hn-vishwas/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-1",
                  "x": 466,
                  "y": 248,
                  "desk": "B-211-02",
                  "person": "Dr. Nalini Sampath",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/s-nalini/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-2",
                  "x": 500,
                  "y": 248,
                  "desk": "B-211-03",
                  "person": "Sreebha Bhaskaran",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/b-sreebha/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-3",
                  "x": 534,
                  "y": 248,
                  "desk": "B-211-04",
                  "person": "Kavitha C. R.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/cr-kavitha/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-4",
                  "x": 568,
                  "y": 248,
                  "desk": "B-211-05",
                  "person": "Dr. Priyanka Vivek",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/v-priyanka/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-5",
                  "x": 432,
                  "y": 284,
                  "desk": "B-211-06",
                  "person": "Dr. Rajesh M.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/rajesh-m/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-6",
                  "x": 466,
                  "y": 284,
                  "desk": "B-211-07",
                  "person": "Sangita Khare",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/k-sangita/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-7",
                  "x": 500,
                  "y": 284,
                  "desk": "B-211-08",
                  "person": "Dr. Ullas S",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/s-ullas/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-8",
                  "x": 534,
                  "y": 284,
                  "desk": "B-211-09",
                  "person": "Dr. Shinu M. R.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/shinu-mr/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-211-9",
                  "x": 568,
                  "y": 284,
                  "desk": "B-211-10",
                  "person": "Dr. Nandu C. Nair",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/nandu-c-nair/",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "CSE/AIE",
                "Faculty": "10 listed",
                "Source": "amrita.edu"
              }
            },
            {
              "id": "c-b-2-12",
              "type": "office",
              "label": "B-212",
              "name": "CSE Faculty Room 4",
              "shape": "rect",
              "x": 603,
              "y": 26,
              "w": 178,
              "h": 137,
              "node": "n3",
              "meta": {
                "Department": "CSE"
              },
              "seats": [
                {
                  "id": "c-b-2-CSE-212-0",
                  "x": 624,
                  "y": 97,
                  "desk": "B-212-01",
                  "person": "Dr. Nidhin Prabhakar T. V.",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/nidhin-prabhakar-t-v/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-1",
                  "x": 654,
                  "y": 97,
                  "desk": "B-212-02",
                  "person": "Dr. Gayathri Ramasamy",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/gayathri-ramasamy/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-2",
                  "x": 684,
                  "y": 97,
                  "desk": "B-212-03",
                  "person": "Dr. Reena Panwar",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/reena-panwar/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-3",
                  "x": 714,
                  "y": 97,
                  "desk": "B-212-04",
                  "person": "Dr. Sajitha Krishnan",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/sajitha-krishnan/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-4",
                  "x": 744,
                  "y": 97,
                  "desk": "B-212-05",
                  "person": "Dr. Daddala Yasoomkari",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/daddala-yasoomkari/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-5",
                  "x": 624,
                  "y": 133,
                  "desk": "B-212-06",
                  "person": "Dr. Sanghamitra Mishra",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/sanghamitra-mishra/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-6",
                  "x": 654,
                  "y": 133,
                  "desk": "B-212-07",
                  "person": "Dr. Amulyashree S",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/amulyashree-s/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-7",
                  "x": 684,
                  "y": 133,
                  "desk": "B-212-08",
                  "person": "Dr. Niharika Panda",
                  "role": "Assistant Professor",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/niharika-panda/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-8",
                  "x": 714,
                  "y": 133,
                  "desk": "B-212-09",
                  "person": "Niranjan D K",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/niranjan-d-k/",
                  "hours": "\u2014"
                },
                {
                  "id": "c-b-2-CSE-212-9",
                  "x": 744,
                  "y": 133,
                  "desk": "B-212-10",
                  "person": "Aiswariya Milan K.",
                  "role": "Assistant Professor (OC)",
                  "dept": "CSE",
                  "url": "https://www.amrita.edu/faculty/aiswariya-milan-k/",
                  "hours": "\u2014"
                }
              ]
            }
          ]
        }
      ]
    },
    "c": {
      "name": "Block C",
      "verified": false,
      "floors": [
        {
          "id": "c-g",
          "name": "Ground Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 357,
              "y": 390
            },
            {
              "id": "n2",
              "x": 643,
              "y": 390
            },
            {
              "id": "n3",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ]
          ],
          "spaces": [
            {
              "id": "b-c-g-0",
              "type": "lab",
              "label": "C-G1",
              "name": "Computer Lab 1",
              "capacity": 60,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "b-c-g-1",
              "type": "lab",
              "label": "C-G2",
              "name": "Computer Lab 2",
              "capacity": 60,
              "shape": "rect",
              "x": 266,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "b-c-g-2",
              "type": "classroom",
              "label": "C-G3",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 507,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "b-c-g-3",
              "type": "classroom",
              "label": "C-G4",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 748,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "b-c-g-4",
              "type": "amenity",
              "label": "Valmiki",
              "name": "Valmiki Hall",
              "capacity": 80,
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 200,
              "h": 140,
              "node": "n0",
              "meta": {
                "Use": "Seminars, placement, presentations",
                "Source": "amrita.edu ICTS",
                "RealCapacity": "80 seats (verified from amrita.edu ICTS)",
                "InferredFrom": "Your photos + Google Maps + ICTS + window count ~6m/room"
              }
            },
            {
              "id": "b-c-g-5",
              "type": "classroom",
              "label": "C-G6",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 266,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "b-c-g-6",
              "type": "office",
              "label": "C-G7",
              "name": "Mechanical Faculty Room 1",
              "shape": "rect",
              "x": 507,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n2",
              "seats": [
                {
                  "id": "b-c-g-B-G7-0",
                  "x": 534,
                  "y": 248,
                  "desk": "C-G7-01",
                  "person": "Dr. Rajeevlochana G. Chittawadigi",
                  "role": "Vice Chairperson Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/rg-chittawadigi",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-1",
                  "x": 568,
                  "y": 248,
                  "desk": "C-G7-02",
                  "person": "Divya Sharma S. G.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/sg-divya",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-2",
                  "x": 603,
                  "y": 248,
                  "desk": "C-G7-03",
                  "person": "Dr. Bikram Singh Solanki",
                  "role": "Assistant Professor Level 10",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/bikram-singh-solanki",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-3",
                  "x": 637,
                  "y": 248,
                  "desk": "C-G7-04",
                  "person": "Dr. Dileep B. P.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/bp-dileep",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-4",
                  "x": 672,
                  "y": 248,
                  "desk": "C-G7-05",
                  "person": "Dr. Mohan Kumar S.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/s-mohankumar",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-5",
                  "x": 706,
                  "y": 248,
                  "desk": "C-G7-06",
                  "person": "Dr. Mrudula Prashanth",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/p-mrudula",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-6",
                  "x": 534,
                  "y": 284,
                  "desk": "C-G7-07",
                  "person": "Dr. Phanibhushana M. V.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/mv-phanibhushana",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-7",
                  "x": 568,
                  "y": 284,
                  "desk": "C-G7-08",
                  "person": "Dr. Pradeep S. Jakkareddy",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/js-pradeep",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-8",
                  "x": 603,
                  "y": 284,
                  "desk": "C-G7-09",
                  "person": "Dr. Prakash Marimuthu K.",
                  "role": "Assistant Professor (Sl. Gd.) Deputy Academic Co-Ordinator",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/k-prakash",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-9",
                  "x": 637,
                  "y": 284,
                  "desk": "C-G7-10",
                  "person": "Dr. Prashanth B N",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/bn-prashanth",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-g-B-G7-10",
                  "x": 672,
                  "y": 284,
                  "desk": "C-G7-11",
                  "person": "Dr. Puja Sengupta",
                  "role": "Assistant Professor Level 10",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/puja-sengupta",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "Mechanical",
                "Faculty": "11 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "b-c-g-7",
              "type": "support",
              "label": "C-G8",
              "name": "Utility",
              "shape": "rect",
              "x": 748,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n3",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "b-c-g-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n2",
              "linksTo": "c-1"
            },
            {
              "id": "b-c-g-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n3"
            },
            {
              "id": "b-c-g-ent",
              "type": "entrance",
              "label": "Entrance",
              "name": "Block C Entrance",
              "shape": "rect",
              "x": 90,
              "y": 365,
              "w": 110,
              "h": 46,
              "node": "n0"
            }
          ]
        },
        {
          "id": "c-1",
          "name": "First Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 357,
              "y": 390
            },
            {
              "id": "n2",
              "x": 643,
              "y": 390
            },
            {
              "id": "n3",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ]
          ],
          "spaces": [
            {
              "id": "b-c-1-0",
              "type": "amenity",
              "label": "Vyasa",
              "name": "Vyasa Hall",
              "capacity": 90,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 200,
              "h": 140,
              "node": "n0",
              "meta": {
                "Use": "Seminars, student presentations",
                "Source": "amrita.edu ICTS",
                "RealCapacity": "90 seats (verified from amrita.edu ICTS)",
                "InferredFrom": "Your photos + Google Maps + ICTS + window count ~6m/room"
              }
            },
            {
              "id": "b-c-1-1",
              "type": "amenity",
              "label": "Rama",
              "name": "Rama Hall",
              "capacity": 85,
              "shape": "rect",
              "x": 266,
              "y": 26,
              "w": 200,
              "h": 140,
              "node": "n1",
              "meta": {
                "Use": "Seminars, student presentations",
                "Source": "amrita.edu ICTS",
                "RealCapacity": "85 seats (verified from amrita.edu ICTS)",
                "InferredFrom": "Your photos + Google Maps + ICTS + window count ~6m/room"
              }
            },
            {
              "id": "b-c-1-2",
              "type": "classroom",
              "label": "C-103",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 507,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "b-c-1-3",
              "type": "classroom",
              "label": "C-104",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 748,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "b-c-1-4",
              "type": "lab",
              "label": "C-105",
              "name": "Project Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "b-c-1-5",
              "type": "office",
              "label": "C-106",
              "name": "Mechanical Faculty Room 2",
              "shape": "rect",
              "x": 266,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n1",
              "seats": [
                {
                  "id": "b-c-1-B-106-0",
                  "x": 293,
                  "y": 248,
                  "desk": "C-106-01",
                  "person": "Dr. Ravi Kumar V.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/v-ravikumar",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-1",
                  "x": 327,
                  "y": 248,
                  "desk": "C-106-02",
                  "person": "Dr. Shali S.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/s-shali",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-2",
                  "x": 362,
                  "y": 248,
                  "desk": "C-106-03",
                  "person": "Dr. Shankara",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/k-shankara",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-3",
                  "x": 396,
                  "y": 248,
                  "desk": "C-106-04",
                  "person": "Dr. Shashi Kumar M. E.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/me-shashikumar",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-4",
                  "x": 431,
                  "y": 248,
                  "desk": "C-106-05",
                  "person": "Dr. Smita Singh",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/smita-singh",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-5",
                  "x": 465,
                  "y": 248,
                  "desk": "C-106-06",
                  "person": "Dr. Ulhas K Annigeri",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/uk-annigeri",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-6",
                  "x": 293,
                  "y": 284,
                  "desk": "C-106-07",
                  "person": "Dr. Y. P. Deepthi",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/p-deepthi",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-7",
                  "x": 327,
                  "y": 284,
                  "desk": "C-106-08",
                  "person": "Prof. Sriram Devanathan",
                  "role": "Principal Professor",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/sriram",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-8",
                  "x": 362,
                  "y": 284,
                  "desk": "C-106-09",
                  "person": "Raghavendra Ravikiran K.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/kr-ravikiran",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-9",
                  "x": 396,
                  "y": 284,
                  "desk": "C-106-10",
                  "person": "S. Bhanu Prakash",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/b-prakash",
                  "hours": "\u2014"
                },
                {
                  "id": "b-c-1-B-106-10",
                  "x": 431,
                  "y": 284,
                  "desk": "C-106-11",
                  "person": "Vinod Kotebavi",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Mechanical",
                  "url": "https://www.amrita.edu/faculty/k-vinod",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "Mechanical",
                "Faculty": "11 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "b-c-1-6",
              "type": "classroom",
              "label": "C-107",
              "name": "Classroom",
              "capacity": 70,
              "shape": "rect",
              "x": 507,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "b-c-1-7",
              "type": "support",
              "label": "C-108",
              "name": "Utility",
              "shape": "rect",
              "x": 748,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n3",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "b-c-1-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n2",
              "linksTo": "c-g"
            },
            {
              "id": "b-c-1-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n3"
            }
          ]
        }
      ]
    },
    "d": {
      "name": "Block D",
      "verified": false,
      "floors": [
        {
          "id": "d-g",
          "name": "Ground Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 500,
              "y": 390
            },
            {
              "id": "n2",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ]
          ],
          "spaces": [
            {
              "id": "a-d-g-0",
              "type": "lab",
              "label": "D-G1",
              "name": "Physics Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 307,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "a-d-g-1",
              "type": "lab",
              "label": "D-G2",
              "name": "Chemistry Lab",
              "capacity": 40,
              "shape": "rect",
              "x": 347,
              "y": 26,
              "w": 307,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "a-d-g-2",
              "type": "support",
              "label": "D-G3",
              "name": "Lab Store",
              "shape": "rect",
              "x": 667,
              "y": 26,
              "w": 307,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "a-d-g-3",
              "type": "classroom",
              "label": "D-G4",
              "name": "Tutorial Room",
              "capacity": 40,
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 307,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "a-d-g-4",
              "type": "classroom",
              "label": "D-G5",
              "name": "Classroom",
              "capacity": 60,
              "shape": "rect",
              "x": 347,
              "y": 177,
              "w": 307,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "a-d-g-5",
              "type": "support",
              "label": "D-G6",
              "name": "Utility",
              "shape": "rect",
              "x": 667,
              "y": 177,
              "w": 307,
              "h": 137,
              "node": "n2",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "a-d-g-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n1",
              "linksTo": "d-1"
            },
            {
              "id": "a-d-g-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n2"
            },
            {
              "id": "a-d-g-ent",
              "type": "entrance",
              "label": "Entrance",
              "name": "Block D Entrance",
              "shape": "rect",
              "x": 90,
              "y": 365,
              "w": 110,
              "h": 46,
              "node": "n0"
            }
          ]
        },
        {
          "id": "d-1",
          "name": "First Floor",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,355 L960,355 L960,415 L40,415 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 390
            },
            {
              "id": "n1",
              "x": 500,
              "y": 390
            },
            {
              "id": "n2",
              "x": 930,
              "y": 390
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ]
          ],
          "spaces": [
            {
              "id": "a-d-1-0",
              "type": "classroom",
              "label": "D-101",
              "name": "Classroom",
              "capacity": 60,
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 307,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "a-d-1-1",
              "type": "classroom",
              "label": "D-102",
              "name": "Classroom",
              "capacity": 60,
              "shape": "rect",
              "x": 347,
              "y": 26,
              "w": 307,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "a-d-1-2",
              "type": "office",
              "label": "D-103",
              "name": "Sciences Faculty Room (Chem/Phys)",
              "shape": "rect",
              "x": 667,
              "y": 26,
              "w": 307,
              "h": 137,
              "node": "n2",
              "seats": [
                {
                  "id": "a-d-1-A-103-0",
                  "x": 704,
                  "y": 97,
                  "desk": "D-103-01",
                  "person": "Dr. S. Giridhar Reddy",
                  "role": "Chairperson",
                  "dept": "Chemistry",
                  "url": "https://www.amrita.edu/faculty/s-giri",
                  "hours": "\u2014"
                },
                {
                  "id": "a-d-1-A-103-1",
                  "x": 782,
                  "y": 97,
                  "desk": "D-103-02",
                  "person": "Dr. Amrita Thakur",
                  "role": "Assistant Professor (Sl.Gd.)",
                  "dept": "Chemistry",
                  "url": "https://www.amrita.edu/faculty/t-amrita",
                  "hours": "\u2014"
                },
                {
                  "id": "a-d-1-A-103-2",
                  "x": 859,
                  "y": 97,
                  "desk": "D-103-03",
                  "person": "Dr. Anil Kumar S.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "Chemistry",
                  "url": "https://www.amrita.edu/faculty/s-anilkumar",
                  "hours": "\u2014"
                },
                {
                  "id": "a-d-1-A-103-3",
                  "x": 937,
                  "y": 97,
                  "desk": "D-103-04",
                  "person": "Dr. B. L. Bhaskar",
                  "role": "Assistant Professor (Sl.Gd.)",
                  "dept": "Chemistry",
                  "url": "https://www.amrita.edu/faculty/bl-bhaskar",
                  "hours": "\u2014"
                },
                {
                  "id": "a-d-1-A-103-4",
                  "x": 704,
                  "y": 133,
                  "desk": "D-103-05",
                  "person": "Dr. B. Siva Kumar",
                  "role": "Associate Professor",
                  "dept": "Chemistry",
                  "url": "https://www.amrita.edu/faculty/b-sivakumar",
                  "hours": "\u2014"
                },
                {
                  "id": "a-d-1-A-103-5",
                  "x": 782,
                  "y": 133,
                  "desk": "D-103-06",
                  "person": "Dr. T. M. Mohan Kumar",
                  "role": "Assistant Professor",
                  "dept": "Chemistry",
                  "url": "https://www.amrita.edu/faculty/tm-mohankumar",
                  "hours": "\u2014"
                },
                {
                  "id": "a-d-1-A-103-6",
                  "x": 859,
                  "y": 133,
                  "desk": "D-103-07",
                  "person": "H. Manjunatha",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Physics",
                  "url": "https://www.amrita.edu/faculty/h-manjunath",
                  "hours": "\u2014"
                }
              ],
              "meta": {
                "Department": "Chemistry",
                "Faculty": "7 listed",
                "Source": "amrita.edu department faculty pages"
              }
            },
            {
              "id": "a-d-1-3",
              "type": "classroom",
              "label": "D-104",
              "name": "Classroom",
              "capacity": 60,
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 307,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "a-d-1-4",
              "type": "lab",
              "label": "D-105",
              "name": "Research Lab",
              "capacity": 30,
              "shape": "rect",
              "x": 347,
              "y": 177,
              "w": 307,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "a-d-1-5",
              "type": "support",
              "label": "D-106",
              "name": "Utility",
              "shape": "rect",
              "x": 667,
              "y": 177,
              "w": 307,
              "h": 137,
              "node": "n2",
              "meta": {
                "Note": "Drinking water facility every floor per student reviews + WiFi",
                "Source": "shiksha.com + collegedunia reviews"
              }
            },
            {
              "id": "a-d-1-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 365,
              "w": 70,
              "h": 46,
              "node": "n1",
              "linksTo": "d-g"
            },
            {
              "id": "a-d-1-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 365,
              "w": 66,
              "h": 46,
              "node": "n2"
            }
          ]
        }
      ]
    },
    "e": {
      "name": "Block E (Main / New Block) \u2014 SQUARE 50.8x50.8m per your correction, all halls in 1st 2nd 3rd floor",
      "verified": false,
      "floors": [
        {
          "id": "e-g",
          "name": "Ground Floor \u2014 Square, Admin only (no halls per your correction)",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,320 L960,320 L960,400 L40,400 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 360
            },
            {
              "id": "n1",
              "x": 250,
              "y": 360
            },
            {
              "id": "n2",
              "x": 430,
              "y": 360
            },
            {
              "id": "n3",
              "x": 610,
              "y": 360
            },
            {
              "id": "n4",
              "x": 790,
              "y": 360
            },
            {
              "id": "n5",
              "x": 930,
              "y": 360
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ],
            [
              "n4",
              "n5"
            ]
          ],
          "spaces": [
            {
              "id": "e-e-g-0",
              "type": "entrance",
              "label": "Lobby",
              "name": "Main Entrance & Reception",
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n0",
              "meta": {
                "Shape": "Square 50.8x50.8m per your correction"
              }
            },
            {
              "id": "e-e-g-1",
              "type": "admin",
              "label": "E-G2",
              "name": "Administrative Office",
              "shape": "rect",
              "x": 266,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "e-e-g-2",
              "type": "admin",
              "label": "E-G3",
              "name": "Director's Office",
              "shape": "rect",
              "x": 507,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "e-e-g-3",
              "type": "admin",
              "label": "E-G4",
              "name": "Admissions Office",
              "shape": "rect",
              "x": 748,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "e-e-g-4",
              "type": "support",
              "label": "E-G5",
              "name": "Security",
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "e-e-g-5",
              "type": "admin",
              "label": "E-G6",
              "name": "Accounts Office",
              "shape": "rect",
              "x": 266,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "e-e-g-6",
              "type": "amenity",
              "label": "E-G7",
              "name": "Medical Room",
              "shape": "rect",
              "x": 507,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "e-e-g-7",
              "type": "support",
              "label": "E-G8",
              "name": "Bank / ATM",
              "shape": "rect",
              "x": 748,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "e-e-g-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Central Staircase",
              "shape": "rect",
              "x": 465,
              "y": 330,
              "w": 70,
              "h": 50,
              "node": "n2"
            },
            {
              "id": "e-e-g-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 330,
              "w": 66,
              "h": 50,
              "node": "n5"
            },
            {
              "id": "e-e-g-ent",
              "type": "entrance",
              "label": "Entrance",
              "name": "E Block Entrance",
              "shape": "rect",
              "x": 90,
              "y": 330,
              "w": 110,
              "h": 50,
              "node": "n0"
            }
          ]
        },
        {
          "id": "e-1",
          "name": "First Floor \u2014 Square, Halls: Amriteshwari 265, Sudhamani 300, Krishna 112 (all in E Block per your correction)",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,320 L960,320 L960,400 L40,400 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 360
            },
            {
              "id": "n1",
              "x": 250,
              "y": 360
            },
            {
              "id": "n2",
              "x": 430,
              "y": 360
            },
            {
              "id": "n3",
              "x": 610,
              "y": 360
            },
            {
              "id": "n4",
              "x": 790,
              "y": 360
            },
            {
              "id": "n5",
              "x": 930,
              "y": 360
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ],
            [
              "n4",
              "n5"
            ]
          ],
          "spaces": [
            {
              "id": "e-e-1-0",
              "type": "amenity",
              "label": "Amriteshwari",
              "name": "Amriteshwari Hall",
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 300,
              "h": 160,
              "node": "n0",
              "capacity": 265,
              "meta": {
                "Floor": "E Block 1st per your correction"
              }
            },
            {
              "id": "e-e-1-1",
              "type": "amenity",
              "label": "Sudhamani",
              "name": "Sudhamani Hall",
              "shape": "rect",
              "x": 340,
              "y": 26,
              "w": 300,
              "h": 160,
              "node": "n1",
              "capacity": 300,
              "meta": {
                "Floor": "E Block 1st"
              }
            },
            {
              "id": "e-e-1-2",
              "type": "amenity",
              "label": "Krishna",
              "name": "Krishna Hall",
              "shape": "rect",
              "x": 654,
              "y": 26,
              "w": 220,
              "h": 160,
              "node": "n3",
              "capacity": 112,
              "meta": {
                "Floor": "E Block 1st"
              }
            },
            {
              "id": "e-e-1-3",
              "type": "classroom",
              "label": "E-104",
              "name": "Classroom (80)",
              "shape": "rect",
              "x": 26,
              "y": 200,
              "w": 180,
              "h": 110,
              "node": "n0",
              "capacity": 80,
              "meta": {
                "Facing": "North, corridor south open"
              }
            },
            {
              "id": "e-e-1-4",
              "type": "classroom",
              "label": "E-105",
              "name": "Classroom (80)",
              "shape": "rect",
              "x": 220,
              "y": 200,
              "w": 180,
              "h": 110,
              "node": "n1",
              "capacity": 80
            },
            {
              "id": "e-e-1-5",
              "type": "office",
              "label": "E-106",
              "name": "Mathematics Faculty Room",
              "shape": "rect",
              "x": 414,
              "y": 200,
              "w": 220,
              "h": 110,
              "node": "n2",
              "meta": {
                "Department": "Mathematics"
              },
              "seats": [
                {
                  "id": "e-e-1-E-101-0",
                  "x": 440,
                  "y": 240,
                  "desk": "E-101-01",
                  "person": "Dr. K. V. Nagaraja",
                  "role": "Professor",
                  "dept": "Mathematics",
                  "url": "https://www.amrita.edu/faculty/kv-nagaraja",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-1-E-101-1",
                  "x": 500,
                  "y": 240,
                  "desk": "E-101-02",
                  "person": "Dr. Neetu Srivastava",
                  "role": "Associate Professor",
                  "dept": "Mathematics",
                  "url": "https://www.amrita.edu/faculty/s-neetu",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-1-E-101-2",
                  "x": 560,
                  "y": 240,
                  "desk": "E-101-03",
                  "person": "Dr. Sarada Jayan",
                  "role": "Associate Professor",
                  "dept": "Mathematics",
                  "url": "https://www.amrita.edu/faculty/j-sarada",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-1-E-101-3",
                  "x": 600,
                  "y": 240,
                  "desk": "E-101-04",
                  "person": "Mamatha T. M.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "Mathematics",
                  "url": "https://www.amrita.edu/faculty/tm-mamatha",
                  "hours": "\u2014"
                }
              ]
            },
            {
              "id": "e-e-1-6",
              "type": "office",
              "label": "E-107",
              "name": "English Faculty Room",
              "shape": "rect",
              "x": 648,
              "y": 200,
              "w": 220,
              "h": 110,
              "node": "n4",
              "meta": {
                "Department": "English"
              },
              "seats": [
                {
                  "id": "e-e-1-E-105-0",
                  "x": 670,
                  "y": 240,
                  "desk": "E-105-01",
                  "person": "Dr. Deepakumari S.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "English",
                  "url": "https://www.amrita.edu/faculty/s-deepakumari",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-1-E-105-1",
                  "x": 720,
                  "y": 240,
                  "desk": "E-105-02",
                  "person": "Dr. Deepthi Janardhan",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "English",
                  "url": "https://www.amrita.edu/faculty/j-deepthi",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-1-E-105-2",
                  "x": 770,
                  "y": 240,
                  "desk": "E-105-03",
                  "person": "Dr. Sayant Vijay",
                  "role": "Assistant Professor",
                  "dept": "English",
                  "url": "https://www.amrita.edu/faculty/sayant-vijay",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-1-E-105-3",
                  "x": 810,
                  "y": 240,
                  "desk": "E-105-04",
                  "person": "Dr. Smita Sail",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "English",
                  "url": "https://www.amrita.edu/faculty/s-smita",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-1-E-105-4",
                  "x": 850,
                  "y": 240,
                  "desk": "E-105-05",
                  "person": "Revathy Hemachandran",
                  "role": "Assistant Professor",
                  "dept": "English",
                  "url": "https://www.amrita.edu/faculty/revathy-hemachandran",
                  "hours": "\u2014"
                }
              ]
            },
            {
              "id": "e-e-1-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 330,
              "w": 70,
              "h": 50,
              "node": "n2"
            },
            {
              "id": "e-e-1-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 330,
              "w": 66,
              "h": 50,
              "node": "n5"
            }
          ]
        },
        {
          "id": "e-2",
          "name": "Second Floor \u2014 Square, Halls: Vyasa 90, Rama 85, Valmiki 80, Conference 27 (E Block per your correction)",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,320 L960,320 L960,400 L40,400 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 360
            },
            {
              "id": "n1",
              "x": 250,
              "y": 360
            },
            {
              "id": "n2",
              "x": 430,
              "y": 360
            },
            {
              "id": "n3",
              "x": 610,
              "y": 360
            },
            {
              "id": "n4",
              "x": 790,
              "y": 360
            },
            {
              "id": "n5",
              "x": 930,
              "y": 360
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ],
            [
              "n4",
              "n5"
            ]
          ],
          "spaces": [
            {
              "id": "e-e-2-0",
              "type": "amenity",
              "label": "Vyasa",
              "name": "Vyasa Hall",
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 220,
              "h": 160,
              "node": "n0",
              "capacity": 90,
              "meta": {
                "Floor": "E Block 2nd per your correction"
              }
            },
            {
              "id": "e-e-2-1",
              "type": "amenity",
              "label": "Rama",
              "name": "Rama Hall",
              "shape": "rect",
              "x": 260,
              "y": 26,
              "w": 220,
              "h": 160,
              "node": "n1",
              "capacity": 85,
              "meta": {
                "Floor": "E Block 2nd"
              }
            },
            {
              "id": "e-e-2-2",
              "type": "amenity",
              "label": "Valmiki",
              "name": "Valmiki Hall",
              "shape": "rect",
              "x": 494,
              "y": 26,
              "w": 220,
              "h": 160,
              "node": "n2",
              "capacity": 80,
              "meta": {
                "Floor": "E Block 2nd"
              }
            },
            {
              "id": "e-e-2-3",
              "type": "amenity",
              "label": "Conference",
              "name": "Conference Hall",
              "shape": "rect",
              "x": 728,
              "y": 26,
              "w": 200,
              "h": 160,
              "node": "n4",
              "capacity": 27,
              "meta": {
                "Floor": "E Block 2nd"
              }
            },
            {
              "id": "e-e-2-4",
              "type": "classroom",
              "label": "E-205",
              "name": "Classroom (80)",
              "shape": "rect",
              "x": 26,
              "y": 200,
              "w": 180,
              "h": 110,
              "node": "n0",
              "capacity": 80
            },
            {
              "id": "e-e-2-5",
              "type": "classroom",
              "label": "E-206",
              "name": "Classroom (80)",
              "shape": "rect",
              "x": 220,
              "y": 200,
              "w": 180,
              "h": 110,
              "node": "n1",
              "capacity": 80
            },
            {
              "id": "e-e-2-6",
              "type": "office",
              "label": "E-204",
              "name": "SoE Faculty Room",
              "shape": "rect",
              "x": 414,
              "y": 200,
              "w": 220,
              "h": 110,
              "node": "n2",
              "meta": {
                "Department": "SoE"
              },
              "seats": [
                {
                  "id": "e-e-2-E-204-0",
                  "x": 440,
                  "y": 240,
                  "desk": "E-204-01",
                  "person": "Dr. B. Venkatesh",
                  "role": "Professor",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/b-venkatesh",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-1",
                  "x": 500,
                  "y": 240,
                  "desk": "E-204-02",
                  "person": "Dr. Geetha K. N.",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/kn-geetha",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-2",
                  "x": 560,
                  "y": 240,
                  "desk": "E-204-03",
                  "person": "Dr. K. Murali",
                  "role": "Assistant Professor (Sl. Gd.)",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/k-murali",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-3",
                  "x": 600,
                  "y": 240,
                  "desk": "E-204-04",
                  "person": "Dr. K. N. Meera",
                  "role": "Associate Professor",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/kn-meera",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-4",
                  "x": 440,
                  "y": 270,
                  "desk": "E-204-05",
                  "person": "Dr. K. N. Venkatachalaiah",
                  "role": "Associate Professor",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/kn-venkatachalaiah",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-5",
                  "x": 500,
                  "y": 270,
                  "desk": "E-204-06",
                  "person": "Dr. Kumaraswamy G. N.",
                  "role": "Associate Professor",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/gnk-swamy",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-6",
                  "x": 560,
                  "y": 270,
                  "desk": "E-204-07",
                  "person": "Dr. Sasangan Ramanathan",
                  "role": "Dean Faculty",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/sasangan",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-7",
                  "x": 600,
                  "y": 270,
                  "desk": "E-204-08",
                  "person": "Dr. V. Kesavulu Naidu",
                  "role": "Associate Professor",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/v-kesavulu",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-2-E-204-8",
                  "x": 630,
                  "y": 270,
                  "desk": "E-204-09",
                  "person": "Rajesh R.",
                  "role": "Assistant Professor",
                  "dept": "School of Engineering",
                  "url": "https://www.amrita.edu/faculty/r-rajesh",
                  "hours": "\u2014"
                }
              ]
            },
            {
              "id": "e-e-2-7",
              "type": "lab",
              "label": "E-207",
              "name": "AIE Research Lab",
              "shape": "rect",
              "x": 648,
              "y": 200,
              "w": 220,
              "h": 110,
              "node": "n4",
              "capacity": 30,
              "meta": {
                "Department": "AIE"
              }
            },
            {
              "id": "e-e-2-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 330,
              "w": 70,
              "h": 50,
              "node": "n2"
            },
            {
              "id": "e-e-2-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 330,
              "w": 66,
              "h": 50,
              "node": "n5"
            }
          ]
        },
        {
          "id": "e-3",
          "name": "Third Floor \u2014 Square, Halls: Indo-US 62, E-Learning 120, Akshaya 100 (E Block per your correction)",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,320 L960,320 L960,400 L40,400 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 360
            },
            {
              "id": "n1",
              "x": 250,
              "y": 360
            },
            {
              "id": "n2",
              "x": 430,
              "y": 360
            },
            {
              "id": "n3",
              "x": 610,
              "y": 360
            },
            {
              "id": "n4",
              "x": 790,
              "y": 360
            },
            {
              "id": "n5",
              "x": 930,
              "y": 360
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ],
            [
              "n4",
              "n5"
            ]
          ],
          "spaces": [
            {
              "id": "e-e-3-0",
              "type": "amenity",
              "label": "Indo-US",
              "name": "Indo-US Corporate Classroom",
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 250,
              "h": 160,
              "node": "n0",
              "capacity": 62,
              "meta": {
                "Floor": "E Block 3rd per your correction"
              }
            },
            {
              "id": "e-e-3-1",
              "type": "amenity",
              "label": "E-Learning",
              "name": "E-Learning Studio (A-VIEW)",
              "shape": "rect",
              "x": 290,
              "y": 26,
              "w": 250,
              "h": 160,
              "node": "n1",
              "capacity": 120,
              "meta": {
                "Floor": "E Block 3rd"
              }
            },
            {
              "id": "e-e-3-2",
              "type": "amenity",
              "label": "Akshaya",
              "name": "Akshaya Hall",
              "shape": "rect",
              "x": 554,
              "y": 26,
              "w": 220,
              "h": 160,
              "node": "n2",
              "capacity": 100,
              "meta": {
                "Source": "Your photo AKSHAYA HALL",
                "Floor": "E Block 3rd per your correction"
              }
            },
            {
              "id": "e-e-3-3",
              "type": "admin",
              "label": "E-304",
              "name": "Research Centre Office",
              "shape": "rect",
              "x": 788,
              "y": 26,
              "w": 180,
              "h": 160,
              "node": "n4"
            },
            {
              "id": "e-e-3-4",
              "type": "classroom",
              "label": "E-305",
              "name": "Classroom (80)",
              "shape": "rect",
              "x": 26,
              "y": 200,
              "w": 180,
              "h": 110,
              "node": "n0",
              "capacity": 80
            },
            {
              "id": "e-e-3-5",
              "type": "classroom",
              "label": "E-306",
              "name": "Classroom (80)",
              "shape": "rect",
              "x": 220,
              "y": 200,
              "w": 180,
              "h": 110,
              "node": "n1",
              "capacity": 80
            },
            {
              "id": "e-e-3-6",
              "type": "office",
              "label": "E-303",
              "name": "AIE Faculty Room",
              "shape": "rect",
              "x": 414,
              "y": 200,
              "w": 220,
              "h": 110,
              "node": "n2",
              "meta": {
                "Department": "AIE"
              },
              "seats": [
                {
                  "id": "e-e-3-E-303-0",
                  "x": 440,
                  "y": 240,
                  "desk": "E-303-01",
                  "person": "Dr. Soman K. P.",
                  "role": "Dean, Professor",
                  "dept": "AIE",
                  "url": "https://www.amrita.edu/faculty/soman-k-p/",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-3-E-303-1",
                  "x": 500,
                  "y": 240,
                  "desk": "E-303-02",
                  "person": "Dr. Sowmya V",
                  "role": "Associate Professor",
                  "dept": "AIE",
                  "url": "https://www.amrita.edu/faculty/sowmya-v/",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-3-E-303-2",
                  "x": 560,
                  "y": 240,
                  "desk": "E-303-03",
                  "person": "Dr. Gopalakrishnan E. A.",
                  "role": "Principal Professor",
                  "dept": "AIE",
                  "url": "https://www.amrita.edu/faculty/gopalakrishnan-e-a/",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-3-E-303-3",
                  "x": 440,
                  "y": 270,
                  "desk": "E-303-04",
                  "person": "Vijay Krishna Menon",
                  "role": "Assistant Professor",
                  "dept": "AIE",
                  "url": "https://www.amrita.edu/faculty/vijay-krishna-menon/",
                  "hours": "\u2014"
                },
                {
                  "id": "e-e-3-E-303-4",
                  "x": 500,
                  "y": 270,
                  "desk": "E-303-05",
                  "person": "Dr. Sajith Variyar V. V.",
                  "role": "Assistant Professor (Sr. Gd.)",
                  "dept": "AIE",
                  "url": "https://www.amrita.edu/faculty/sajith-variyar/",
                  "hours": "\u2014"
                }
              ]
            },
            {
              "id": "e-e-3-7",
              "type": "lab",
              "label": "E-308",
              "name": "Project Lab",
              "shape": "rect",
              "x": 648,
              "y": 200,
              "w": 220,
              "h": 110,
              "node": "n4",
              "capacity": 40
            },
            {
              "id": "e-e-3-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 330,
              "w": 70,
              "h": 50,
              "node": "n2"
            },
            {
              "id": "e-e-3-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 330,
              "w": 66,
              "h": 50,
              "node": "n5"
            }
          ]
        },
        {
          "id": "e-4",
          "name": "Fourth Floor \u2014 Square, Library only (1213 sq m, 200 seating)",
          "width": 1000,
          "height": 460,
          "outline": "M20,20 L980,20 L980,440 L20,440 Z",
          "corridors": [
            {
              "d": "M40,320 L960,320 L960,400 L40,400 Z"
            }
          ],
          "nodes": [
            {
              "id": "n0",
              "x": 70,
              "y": 360
            },
            {
              "id": "n1",
              "x": 250,
              "y": 360
            },
            {
              "id": "n2",
              "x": 430,
              "y": 360
            },
            {
              "id": "n3",
              "x": 610,
              "y": 360
            },
            {
              "id": "n4",
              "x": 790,
              "y": 360
            },
            {
              "id": "n5",
              "x": 930,
              "y": 360
            }
          ],
          "edges": [
            [
              "n0",
              "n1"
            ],
            [
              "n1",
              "n2"
            ],
            [
              "n2",
              "n3"
            ],
            [
              "n3",
              "n4"
            ],
            [
              "n4",
              "n5"
            ]
          ],
          "spaces": [
            {
              "id": "e-e-4-0",
              "type": "amenity",
              "label": "Library",
              "name": "Central Library \u2014 Stacks",
              "shape": "rect",
              "x": 26,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n0",
              "meta": {
                "Location": "New Block 4th floor",
                "Area": "1213 sq m"
              }
            },
            {
              "id": "e-e-4-1",
              "type": "amenity",
              "label": "Reference",
              "name": "Reference & Periodicals",
              "shape": "rect",
              "x": 266,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n1",
              "capacity": 150,
              "meta": {
                "Area": "325 sq m"
              }
            },
            {
              "id": "e-e-4-2",
              "type": "amenity",
              "label": "Digital",
              "name": "Digital Library VIDYA",
              "shape": "rect",
              "x": 507,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "e-e-4-3",
              "type": "amenity",
              "label": "Reading",
              "name": "Reading Hall",
              "shape": "rect",
              "x": 748,
              "y": 26,
              "w": 226,
              "h": 137,
              "node": "n3",
              "capacity": 150,
              "meta": {
                "Hours": "8 AM \u2013 12 AM"
              }
            },
            {
              "id": "e-e-4-4",
              "type": "admin",
              "label": "E-405",
              "name": "Librarian's Office",
              "shape": "rect",
              "x": 26,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n0"
            },
            {
              "id": "e-e-4-5",
              "type": "amenity",
              "label": "E-406",
              "name": "Faculty Lounge",
              "shape": "rect",
              "x": 266,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n1"
            },
            {
              "id": "e-e-4-6",
              "type": "support",
              "label": "E-407",
              "name": "Reprographics",
              "shape": "rect",
              "x": 507,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n2"
            },
            {
              "id": "e-e-4-7",
              "type": "amenity",
              "label": "E-408",
              "name": "E-Resources",
              "shape": "rect",
              "x": 748,
              "y": 177,
              "w": 226,
              "h": 137,
              "node": "n3"
            },
            {
              "id": "e-e-4-st",
              "type": "stairs",
              "label": "Stairs",
              "name": "Staircase",
              "shape": "rect",
              "x": 465,
              "y": 330,
              "w": 70,
              "h": 50,
              "node": "n2"
            },
            {
              "id": "e-e-4-wc",
              "type": "restroom",
              "label": "WC",
              "name": "Restrooms",
              "shape": "rect",
              "x": 850,
              "y": 330,
              "w": 66,
              "h": 50,
              "node": "n5"
            }
          ]
        }
      ]
    }
  }
};
