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
  CURRENT_USER
} from '../../constants/local.storage';
import {
  SelectedAgent
} from 'src/app/objects/SelectedAgent';
import {
  Utility
} from 'src/app/utils/utility';

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
  hasSelectedAgent = !Utility.isUndefined(this.currentUser.selectedAgent);
  showCancelBtn: boolean = false;

  constructor(private router: Router,
    private auths: AuthenticationService,
    private as: AgentService,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.createForm();
    const _this = this;
    if (this.hasSelectedAgent) {
      this.showCancelBtn = true;
      this.as.getAgentList(this.currentUser.selectedAgent.commStructure).then(res => {
        _this.agentLOV = res;
      });

      this.chooseAgentForm.get('commercialStructure').markAsDirty();
      this.chooseAgentForm.get('agent').markAsDirty();
    }

    this.as.getCommercialStructure().then(res => {
      _this.commercialStructureLOV = res;
    });
  }

  createForm() {
    let comval = null;
    let agentval = null;
    if (this.hasSelectedAgent) {
      comval = this.currentUser.selectedAgent.commStructure;
      agentval = this.currentUser.selectedAgent.agentCode;
    }
    this.chooseAgentForm = this.fb.group({
      commercialStructure: [comval, Validators.required],
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
        sa.agentCode = parseInt(res.obj["codAgente"]);
        sa.agentName = res.obj["nomAgente"];
        sa.documentCode = res.obj["codDocumento"];
        sa.documentType = res.obj["tipoDocumento"];
        sa.documentName = res.obj["nomTipoDocumento"];
        sa.agentType = res.obj["tipoAgente"];
        sa.agentTypeName = res.obj["nomTipoAgente"];
        sa.agentAddress = res.obj["dirAgente"];
        sa.commStructure = parseInt(this.chooseAgentForm.get('commercialStructure').value);
        currentUser.selectedAgent = sa;
        //adds chosen agent to current user detail
        localStorage.setItem(CURRENT_USER, JSON.stringify(currentUser));
      }
      this.router.navigate(['']);
    });
  }

}
