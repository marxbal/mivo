export class PolicyHolder {
  isPerson: boolean; //mcaFisico
  isExisting: boolean;
  documentType: string; //tipDocum
  documentCode: string; //codDocum
  policyHolderType: string;
  prefix: number; //tipPrefijoNombre
  suffix: number; //tipSufijoNombre
  firstName: string; //nomTercero
  middleName: string; //nom2Tercero
  lastName: string; //ape2Tercero
  gender: number; //mcaSexo
  birthDate: Date; //fecNacimiento
  mobileNumber: string; //tlfMovil
  correspondenceType: number; //tipEtiqueta
  country: string; //codPais
  state: number; //codEstado
  municipality: number; //codProv
  city: number; //codLocalidad
  address: string; //nomDomicilio1
  zipcode: number; //codPostal
  email: string; //email
  orgDocumentType: string; //tipDocumContacto
  orgDocumentCode: string; //codDocumContacto
  orgNationality: string; //codNacionalidadContacto
  orgFirstName: string; //nomContacto
  orgLastName: string; //ape2Tercero
  orgPost: number; //tipCargo
  orgTypeOfBusiness: number; //tipActEconomica
  personMaritalStatus: string; //codEstCivil
  personProfession: number; //codProfesion
  personOccupation: number; //codOcupacion
  personNationality: string; //codNacionalidad
  personType: number; //tipNacionalidad
  personLanguage: string; //codIdioma
  
  constructor(init?: Partial<PolicyHolder>) {
    Object.assign(this, init);
  }
}