export type CodeDescription = {
  code: string
  description: string
};

export type LoginInfoType = {
  user: {
    personalID: number
    chipID: string
    firstName: string
    middleName: string
    lastName: string
    sex: number
    title: {
      description: {
        thai: {
          shortPrint: string
          fullPrint: string
        }
        english: {
          shortPrint: string
          fullPrint: string
        }
      }
      titleSex: number
    }
  }
  boraEmployee?: BoraEmployee
};

export type BoraEmployee = {
  rcode: {
    code: string
    description: {
      thai: string
      english: string
    }
    idCardDate: number
    parentRcode: number
    regionCode: number
    project3Date: number
    branch: {
      code: string
      description: {
        thai: string
        english: string
      }
      type: number
    }
  }
  job: number
  level: number
  db: string
  place: string
  position: string
  positionManagement: string
  workplace: CodeDescription
};
