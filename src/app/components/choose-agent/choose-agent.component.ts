import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  AuthenticationService
} from '../../services/authentication.service';
import {
  AgentService
} from '../../services/agent.service';
import {
  CURRENT_USER,
  DASH_INFO
} from '../../constants/local.storage';
import {
  SelectedAgent
} from 'src/app/objects/SelectedAgent';
import {
  Utility
} from 'src/app/utils/utility';
import {
  environment
} from 'src/environments/environment';

@Component({
  selector: 'app-choose-agent',
  templateUrl: './choose-agent.component.html',
  styleUrls: ['./choose-agent.component.css']
})
export class ChooseAgentComponent implements OnInit {
  chooseAgentForm: FormGroup;
  commercialStructureLOV: any[];
  agentLOV: any[];
  currentUser = this.auths.currentUserValue;
  execAgent = this.auths.currentUserValue.execAgent;
  hasSelectedAgent = !Utility.isUndefined(this.currentUser.selectedAgent);
  showCancelBtn: boolean = false;
  isStaging = !environment.production;

  constructor(private router: Router,
    private auths: AuthenticationService,
    private as: AgentService,
    private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
    const _this = this;

    if (this.execAgent) {
      this.as.getEAAgentList(this.currentUser.execAgentCode).then(res => {
        _this.agentLOV = res;
      });
      this.chooseAgentForm.get('agent').markAsDirty();
    } else {
      this.as.getCommercialStructure().then(res => {
        _this.commercialStructureLOV = res;
      });
      this.chooseAgentForm.get('commercialStructure').markAsDirty();
      if (this.hasSelectedAgent) {
        this.showCancelBtn = true;
        this.as.getAgentList(this.currentUser.selectedAgent.commStructure).then(res => {
          _this.agentLOV = res;
        });
        this.chooseAgentForm.get('agent').markAsDirty();
      }
    }
  }

  createForm() {
    let comval = null;
    let agentval = null;
    if (this.hasSelectedAgent) {
      comval = !this.execAgent ? this.currentUser.selectedAgent.commStructure : null;
      agentval = this.currentUser.selectedAgent.agentCode;
    }
    this.chooseAgentForm = this.fb.group({
      commercialStructure: [comval, !this.execAgent ? Validators.required : null],
      agent: [agentval, Validators.required],
    });
  }

  comStructureChange() {
    const _this = this;
    const commercialStructure: number = parseInt(this.chooseAgentForm.get('commercialStructure').value);
    this.as.getAgentList(commercialStructure).then(res => {
      _this.agentLOV = res;
    });
  }

  cancel() {
    this.router.navigate(['']);
  };

  next() {
    const currentUser = this.auths.currentUserValue;
    const agentCode: number = parseInt(this.chooseAgentForm.get('agent').value);
    currentUser.agentCode = agentCode;
    //adds chosen agent to current user detail
    localStorage.setItem(CURRENT_USER, JSON.stringify(currentUser));

    const param = {
      agentCode: agentCode
    };

    this.as.getProductionAgentProfile(JSON.stringify(param)).then(res => {
      if (res.status) {
        var sa = new SelectedAgent();

        const agentInfo = res.obj["agentInfo"];

        sa.agentCode = parseInt(agentInfo["codAgente"]);
        sa.agentName = agentInfo["nomAgente"];
        sa.documentCode = agentInfo["codDocumento"];
        sa.documentType = agentInfo["tipoDocumento"];
        sa.documentName = agentInfo["nomTipoDocumento"];
        sa.agentType = agentInfo["tipoAgente"];
        sa.agentTypeName = agentInfo["nomTipoAgente"];
        sa.agentAddress = agentInfo["dirAgente"];
        if (!currentUser.execAgent) {
          sa.commStructure = parseInt(this.chooseAgentForm.get('commercialStructure').value);
        }

        if (currentUser.execAgent && (sa.agentCode === currentUser.execAgentCode)) {
          if (this.hasSelectedAgent) {
            delete currentUser.selectedAgent;
          }
        } else {
          currentUser.selectedAgent = sa;
          if (!currentUser.execAgent) {
            currentUser.commercialStructure = sa.commStructure;
          }
        }

        currentUser.token = "Bearer " + res.obj["token"];

        //adds chosen agent to current user detail
        localStorage.setItem(CURRENT_USER, JSON.stringify(currentUser));
        localStorage.removeItem(DASH_INFO);
      }
      this.router.navigate(['']);
    });
  }

}
