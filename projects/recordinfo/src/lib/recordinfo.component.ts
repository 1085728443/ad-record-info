import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as _ from 'lodash';
import * as _moment from 'moment';
import { Observable } from 'rxjs';
import { isArray } from 'util';
import { ErrorMessage } from './message.enum';
import { DefaultValue, Tile } from './recordTile.class';
import { ShowProcessDetailDialog } from './show-process-detail/show-process-detail.dialog';
const moment = _moment;
declare var XML: any;
declare var $: any;
declare var jsonPath: any;
declare var JSONPath: any;

@Component({
    selector: 'amberdata-recordinfo',
    template: `
    <div class="record--info--wrap" [style.width]="formWidth + 'px'">
    <mat-grid-list [gutterSize]="'0px'" #container cols="18" rowHeight="10px">

        <mat-grid-tile  class="grid--border--box" *ngFor="let tile of tiles;let i = index" [colspan]="tile.options.cols" [rowspan]="tile.options.rows"
        [style.borderLeft]="tile.getStyle('border-left')"
        [style.borderRight]="tile.getStyle('border-right')"
        [style.borderTop]="tile.getStyle('border-top')"
        [style.borderBottom]="tile.getStyle('border-bottom')"
        [style.background]="tile.getStyle('backgroundColor')">
            <div [ngSwitch]="tile.options.contentType" class="tile--options--content--type--box"
                [style.textAlign]="tile.getStyle('text-align')"
                [style.fontWeight]="tile.getStyle('fontWeight')"
                [style.color]="tile.getStyle('fontColor')" [style.fontSize]="tile.getStyle('fontSize') + 'px'"
                [style.background]="tile.getStyle('backgroundColor')">
                <div *ngSwitchCase="'label'" class="label--wrap">
                    <ng-container    *ngIf="language == 'zh-CN'">
                        <span *ngFor="let label of tile.options.labelName" class="label--box">
                            <span class="text-danger" *ngIf="tile.options.required == 'true'">. </span>
                                <span [title]="label.value" *ngIf="label.type == 'text'">{{label.value}}</span>
                                <span [title]="entity[label.value]" *ngIf="label.type == 'attr'">{{entity[label.value]}}</span>
                        </span>
                    </ng-container>
                    <ng-container    *ngIf="language == 'en-US'">
                    <span *ngFor="let label of tile.options.labelNameEn" class="label--box">
                        <span class="text-danger" *ngIf="tile.options.required == 'true'">. </span>
                            <span [title]="label.value" *ngIf="label.type == 'text'">{{label.value}}</span>
                            <span [title]="entity[label.value]" *ngIf="label.type == 'attr'">{{entity[label.value]}}</span>
                    </span>
                </ng-container>
                </div>
                <div *ngSwitchCase="'input'" class="form--build--box--input--box">
                    <input
                    nz-input
                    [title]="entity[tile.options.attrName]"
                    [style.textAlign]="tile.getStyle('text-align')" type="text"
                        formValidPass
                        [scene]="scene"
                        [placeholder]="tile.options.placeholder"
                        [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"
                        [ngClass]="{'showBorder' : tile.getStyle('inputBorder') == 'show'}"
                        [disabled]="disableEdit" class="form-control form--build--box--input"
                        [(ngModel)]="entity[tile.options.attrName]">
                </div>
                <div *ngSwitchCase="'input-number'" class="form--build--box--input--box">
                    <input
                    nz-input
                    [title]="entity[tile.options.attrName]"
                    [style.textAlign]="tile.getStyle('text-align')" type="number"
                        formValidPass
                        [scene]="scene"
                        [placeholder]="tile.options.placeholder"
                        (change)="validNumberInput($event,tile.options.attrName)"
                        [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"
                        [ngClass]="{'showBorder' : tile.getStyle('inputBorder') == 'show'}"
                        [disabled]="disableEdit" class="form-control form--build--box--input"
                        [(ngModel)]="entity[tile.options.attrName]">
                </div>
                <div *ngSwitchCase="'radio-button'" class="radio--build--box">
                    <mat-radio-group [(ngModel)]="entity[tile.options.attrName]" [scene]="scene" formValidPass [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options">
                        <mat-radio-button [disabled]="disableEdit" class="single--radio--btn" *ngFor="let radioAttr of tile.options.radioBtnAttrs" [value]="radioAttr">{{radioAttr}}</mat-radio-button>
                    </mat-radio-group>
                </div>
                <div *ngSwitchCase="'check-box'" class="radio--build--box">
                    <section  class="example-section form--build--box--input">
                        <mat-checkbox
                        formValidPass [scene]="scene" [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"
                        [checked]="isChecked(tile,checkBoxAttr)"
                         [disabled]="disableEdit" (change)="toggleCheckbox($event,tile,checkBoxAttr)" *ngFor="let checkBoxAttr of tile.options.checkBoxAttrs"
                            class="example-margin">{{checkBoxAttr}}</mat-checkbox>
                    </section>
                </div>
                <div *ngSwitchCase="'select'" class="form--build--box--input--box" >
                    <nz-select [ngClass]="{'showBorder' : tile.getStyle('inputBorder') == 'show'}"
                        [nzPlaceHolder]="tile.options.placeholder"
                     formValidPass [scene]="scene" [validPass]="validPass" [formValue]="entity[tile.options.attrName]"
                      [formValidOption]="tile.options"  [disabled]="disableEdit" class="form--build--box--input"
                      [(ngModel)]="entity[tile.options.attrName]">
                    <nz-option
                    *ngFor="let selectAttr of tile.options.selectAttrs"
                     [nzValue]="selectAttr.value"
                     [nzLabel]="selectAttr.displayName"
                     >{{selectAttr.displayName}}</nz-option>
                    </nz-select>
                </div>
                <div *ngSwitchCase="'text-area'" class="form--build--box--input--box">
                    <textarea [ngClass]="{'showBorder' : tile.getStyle('inputBorder') == 'show'}" formValidPass [scene]="scene" [validPass]="validPass" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options" [disabled]="disableEdit" class="form-control form--build--box--input textarea--input" [(ngModel)]="entity[tile.options.attrName]"></textarea>
                </div>

                <div *ngSwitchCase="'date'" class="form--build--box--input--box">
                    <nz-date-picker
                    [nzShowTime]="tile.enableSelectTime()"
                    formValidPass [validPass]="validPass" [scene]="scene" [formValue]="entity[tile.options.attrName]" [formValidOption]="tile.options"
                     [ngClass]="{'showBorder' : tile.getStyle('inputBorder')  == 'show'}"  [(ngModel)]="entity[tile.options.attrName]"
                    class="form-control form--build--box--input"
                    [nzDisabled]="disableEdit"
                    [nzFormat]="tile.getDateFormat()"></nz-date-picker>
                </div>
                <div *ngSwitchCase="'process-list'" class="form--build--box--input--box process--info--wrap">
                <div class="div-body" >
                    <div class="div-title">
                      <span
                        style="
                        text-align: left;
                        color: rgba(122, 107, 107, 0.65);
                        font-size: 14px;
                        ">
                        审批信息
                      </span>
                    </div>
                    <div class="process-list-shenpi">
                      <table class="process-list-th-tbody">
                          <tr class="process-list-th-tr">
                            <td class="process-list-th-title">  <span class="process-list-span">节点     </span> </td>
                            <td class="process-list-th-name">   <span class="process-list-span">操作人   </span> </td>
                            <td class="process-list-th-date">   <span class="process-list-span">操作时间 </span> </td>
                            <td class="process-list-th-cz">     <span class="process-list-span">处理意见  </span> </td>
                          </tr>
                          <tr class="process-list-th-tr" *ngFor="let process of progressNodes;let i = index"
                                    (click)="showProcessDetail(process)">
                            <td> <span class="process-list-span"> {{process.name}}         </span> </td>
                            <td> <span class="process-list-span"> {{process.operator}}     </span> </td>
                            <td> <span class="process-list-span"> {{process.operate_date}} </span> </td>
                            <td> <span class="process-list-span text-shenglue" [title]="handlingOpinions(process)"> {{handlingOpinions(process)}}      </span> </td>
                          </tr>
                        </table>
                    </div>
                  </div>
                </div>
                <div *ngSwitchCase="'table'" class="form--build--box--input--box" style="overflow-y: auto;">
                    <table class="table table-bordered">
                        <tr>
                            <ng-container *ngFor="let tableAttr of tile.options.tableAttrs;let x = index">
                                <th *ngIf="!tableAttr.isNotShow">
                                    {{tableAttr.title}}
                                </th>
                            </ng-container>
                        </tr>
                        <tr *ngFor="let tableEntity of tableEntitys[tile.options.attrName];let e = index">
                            <ng-container *ngFor="let tableAttr of tile.options.tableAttrs;let x = index">
                                <td *ngIf="!tableAttr.isNotShow">
                                    <input [disabled]="disableEdit" type="text" class="form-control form--build--box--input" InitTableValue [tableEntity]="tableEntity" [key]="tableAttr.jsonPath"
                                        [(ngModel)]="tableEntity[tableAttr.jsonPath]">

                                </td>
                            </ng-container>
                            <td>
                                <button *ngIf="!disableEdit" class="btn btn-default fa fa-minus-circle" (click)="tableEntitys[tile.options.attrName].splice(e,1)"></button>
                            </td>
                        </tr>
                        <tr>
                            <button *ngIf="!disableEdit" class="btn btn-default fa fa-plus-circle" (click)="addTableList(tile.options.attrName)"></button>
                        </tr>
                    </table>
                </div>
                <div *ngSwitchCase="'logo'" class="form--build--box--input--box">
                    <img style="height: 100%;
                    width: 100%;"
                    onerror="this.src = './assets/images/icon-40.png'"
                     [src]="tile.options.logoSrc" alt="">
                </div>
                <div *ngSwitchCase="'upload'" class="form--build--box--input--box">
                </div>
                <div *ngSwitchCase="'other-component'" class="form--build--box--input--box">
                    <form-other-component
                    [disableEdit]="disableEdit"
                    [scene]="scene"
                    [tile]="tile"
                    [validPass]="validPass"
                    [keyAttrName]="tile.options.keyAttrName"
                    [valueAttrName]="tile.options.attrName"
                    [_SelectUserServiceGetList]="_SelectUserServiceGetList"
                    [_DepartmentManageServiceGetList]="_DepartmentManageServiceGetList"
                    [_chooseUsersAccessServiceGetRoleList]="_chooseUsersAccessServiceGetRoleList"
                    [_chooseUsersAccessServiceGetUserByDept]="_chooseUsersAccessServiceGetUserByDept"
                    [_chooseUsersAccessServiceGetUserByRole]="_chooseUsersAccessServiceGetUserByRole"
                    [_dwClassManageServiceGetMetadataCategoryInfo]="_dwClassManageServiceGetMetadataCategoryInfo"
                    [_dwClassManageServiceGetMetaSysClassList]="_dwClassManageServiceGetMetaSysClassList"
                    [entity]="entity"
                     [componentType]="tile.options.componentType"></form-other-component>
                </div>
                <div *ngSwitchDefault>请选择一个类型</div>
            </div>
        </mat-grid-tile>
    </mat-grid-list>
  `,
    styleUrls: ['./recordinfo.component.scss']
})
export class RecordinfoComponent implements OnInit {
    /**
     * 显示模版单元格实例的集合
     */
    tiles: Array<Tile> = [];
    /**
     * string转xml对象工具实例
     */
    xotree = new XML.ObjTree();
    /**
     * 元数据信息的map
     */
    jsonData: {[key:string]:any};
    /**
     * 保存record表单信息的map副本
     */
    saveEntity: {[key:string]:any} = {};
    /**
     * 保存table单元格的表单信息
     */
    tableEntitys: {[key:string]:any} = {};
    /**
     * 原record表单信息的map
     */
    entity: {[key:string]:any} = {};
    /**
     * 表单宽度
     */
    formWidth: number = 700
    /**
     * 过程信息集合
     */
    progressNodes: Array<{[key:string]:any}> = []
    /**
     * 校验是否通过
     */
    validPass: boolean = true
    @Input() id: string;
    @Input() objectPath: string;
    @Input() disableEdit: boolean;
    @Input() serverFiles: Array<any>;
    @Input() showTemplateXml: string;
    @Input() jsonMetadataTemplate: {[key:string]:any};
    @Input() info: {[key:string]:any};
    @Input() formType: 'create' | 'edit'
    @Input() language? : 'zh-CN' | 'en-US' = 'zh-CN'
    @Input() getMulModifeProPertyValues: (allowedValuesCode: string) => Promise<{
        value : string,
        displayName : string
    }[]>
    @Input() getDefaultValue: (defaultValue: DefaultValue) => string

    @Input() _SelectUserServiceGetList: () => Observable<any>
    @Input() _DepartmentManageServiceGetList: () => Promise<any>
    @Input() _chooseUsersAccessServiceGetRoleList: () => Promise<any>
    @Input() _chooseUsersAccessServiceGetUserByDept: (groupName: string) => Promise<any>
    @Input() _chooseUsersAccessServiceGetUserByRole: (groupName: string) => Promise<any>
    @Input() _dwClassManageServiceGetMetadataCategoryInfo: (metadataSchemeId: string) => Promise<any>
    @Input() _dwClassManageServiceGetMetaSysClassList: (parentId: string) => Promise<any>
    @Input() environmentBaseUrl: string

    @Input() ApiUrl: any //接口枚举类型
    @Input() baseUrl: string //上传所需url跟地址
    @Input() AuthenticationService: any //用户服务
    @Input() scene?: string
    constructor(
        public dialog: MatDialog
    ) { }

    ngOnInit() {
    }

    isChecked(tile, attr) {
        let str = this.entity[tile.options.attrName]
        if (!str) {
            str = []
        } else {
            str = str.split(',')
        }
        str = _.castArray(str)
        return str.indexOf(attr) >= 0
    }

    async getTemplateModule() {
        try {
            this.serverFiles = this.serverFiles || []
            let json = this.jsonMetadataTemplate
            this.jsonData = json
            this.getShowTemplate()
            this.formatShowJson(this.jsonData.record)
            let filePathName = undefined
            let showTempalteRows = this.xotree.parseXML(this.showTemplateXml).data.saveData
            showTempalteRows.forEach(c => {
                filePathName = c.attrName == "$.record.block[?(@.name=='电子文件')].file" ? "$.record.block[?(@.name=='电子文件')].file" :
                    c.attrName == "$.record.block.file" ? "$.record.block.file" :
                        undefined
            });
            if (!filePathName) {
                return
            }
            if (!this.entity[filePathName]) this.entity[filePathName] = []
            //先把服务器挂接附件功能去掉
            this.serverFiles = []
            this.initProcess()
        } catch (err) {
            console.error(err)
            return
        }
    }

    /**
     * 将重复的block整合成一个block,值存进一个content中
     * @param jsonData
     */
    formatShowJson(jsonData) {
        if (jsonData.file) jsonData.file = _.castArray(jsonData.file)
        if (jsonData.property) {
            jsonData.property = _.castArray(jsonData.property)
            jsonData.property.forEach(pro => {
                delete pro.allowedValues
                delete pro.allowedValuesCode
            });
        }
        if (jsonData.node) {
            jsonData.node = _.castArray(jsonData.node)
            this.progressNodes = jsonData.node
        }
        if (jsonData.block) {
            jsonData.block = _.castArray(jsonData.block)
            jsonData.block.forEach(block => {
                let length = jsonData.block.filter(c => c.name == block.name).length
                if (length > 1) block.can_repeat = 'true'
            });
        }
        if (jsonData.block) {
            let copy_jsonData_blocks = _.cloneDeep(jsonData.block)
            copy_jsonData_blocks.forEach(block => {
                let copyBlock = _.cloneDeep(block)
                if (copyBlock.can_repeat == 'true') {
                    let blocks = copy_jsonData_blocks.filter(c => c.name == copyBlock.name)
                    _.remove(jsonData.block, (n) => n['name'] == copyBlock.name)
                    copyBlock.property = copyBlock.property || []
                    copyBlock.property.forEach(property => {
                        property.content = []
                        blocks.forEach(repeat_block => {
                            property.content.push(
                                repeat_block.property.find(pro => pro.name == property.name).content
                            )
                        });
                    });
                    jsonData.block.push(copyBlock)
                }
            });
            jsonData.block.forEach(c => {
                this.formatShowJson(c)
            });
        }
    }

    async getShowTemplate() {
        let xmlData = this.showTemplateXml
        this.formWidth = Number(this.xotree.parseXML(this.showTemplateXml).data.formWidth) || 700
        let data = this.xotree.parseXML(xmlData).data.saveData
        data.forEach(option => {
            if (!option.style) option.style = {}
            option.radioBtnAttrs = _.castArray(option.radioBtnAttrs);
            option.checkBoxAttrs = _.castArray(option.checkBoxAttrs);
            option.selectAttrs = _.castArray(option.selectAttrs);
            option.getMulModifeProPertyValues = this.getMulModifeProPertyValues,
                this.tiles.push(new Tile(option))
        })
        data.forEach(c => {
            if (c.keyAttrName) {
                if (c.contentType != 'table' && c.contentType != 'upload') {
                    this.entity[c.keyAttrName] = jsonPath(this.jsonData, c.keyAttrName) !== false ?
                        jsonPath(this.jsonData, c.keyAttrName)[0] :
                        ''
                }
            }
            if (c.attrName) {
                if (c.contentType != 'table' && c.contentType != 'upload') {
                    //后台的时间格式为CST,在js这里转换后会多出14小时，所以这里手动减一下
                    if(c.contentType == 'date' && jsonPath(this.jsonData, c.attrName)[0]){
                        let deviation = jsonPath(this.jsonData, c.attrName)[0].indexOf('CST') != -1 ? 14 : 0
                        let hour = moment(jsonPath(this.jsonData, c.attrName)[0]).hour()
                        let date = moment(jsonPath(this.jsonData, c.attrName)[0]).hour(hour - deviation).format('YYYY/MM/DD HH:mm:ss')
                        this.entity[c.attrName]= date
                        return
                    }
                    if (jsonPath(this.jsonData, c.attrName) !== false) {
                        this.entity[c.attrName] = jsonPath(this.jsonData, c.attrName)[0]
                        return
                    }
                    if (this.formType == 'create') {
                        let tile: Tile = this.tiles.find((row: Tile) => row.options.attrName == c.attrName)
                        if(!this.entity[c.attrName]){
                            this.entity[c.attrName] = this.getDefaultValue(tile.options.defaultValue)
                        }
                    } else {
                        this.entity[c.attrName] = ''
                    }
                } else if (c.contentType == 'upload') {
                    let path = c.attrName
                    let files = jsonPath(this.jsonData, path)
                    this.entity[c.attrName] = this.entity[c.attrName] || []
                    if (files == false) {
                        return
                    }
                    if (Array.isArray(files[0])) {
                        files = files[0]
                    }
                    files.forEach(file => {
                        if (file.name && file.checksum_type == "md5") {
                            this.entity[c.attrName].push(file)
                        }
                    });
                } else {
                    this.tableEntitys[c.attrName] = []
                    c.tableAttrs.forEach(tableAttr => {
                        let datas = jsonPath(this.jsonData, tableAttr.jsonPath)
                        if (!datas) {
                            return
                        }
                        let data = _.castArray(datas)
                        if (data) {
                            for (let x = 0; x < data.length; x++) {
                                if (!this.tableEntitys[c.attrName][x]) {
                                    this.tableEntitys[c.attrName].push({})
                                }
                                this.tableEntitys[c.attrName][x][tableAttr.jsonPath] = data[x]
                            }
                        }
                    });
                }
            }
        })
    }

    addTableList(jsonPath) {
        if (!this.tableEntitys[jsonPath]) {
            this.tableEntitys[jsonPath] = []
        }
        this.tableEntitys[jsonPath].push({})
    }
    async editRecord() {
        let tableEntitys = _.cloneDeep(this.tableEntitys)
        this.saveEntity = _.cloneDeep(this.entity)
        for (let key in tableEntitys) {
            tableEntitys[key].forEach(tableEntity => {
                for (let tableKey in tableEntity) {
                    if (!this.saveEntity[tableKey]) {
                        this.saveEntity[tableKey] = []
                    }
                    this.saveEntity[tableKey].push(tableEntity[tableKey])
                }
            });
        }
        var jsonData = _.cloneDeep(this.jsonData)
        // 先去除数组，保证jsonPath能对应
        this.formatArrayItems(jsonData.record)
        // 根据jsonPath填入数据
        this.formatServiceData(jsonData)
        // 把所有单个对象转换成数组
        this.formatObjTOArray(jsonData.record)
        // 将可重复block拆分成多个blcok
        this.formatTableEntity(jsonData.record)
        // 重新转换回正确的服务端需要格式
        this.formatArrayItems(jsonData.record)
        this.deleteEmptyFile(jsonData.record)
        this.validPass = this.checkFormValidator()
        if (!this.validPass) {
            return false
        }
        this.info.jsonData = jsonData
        return true
    }

    checkFormValidator() {
        var validPass = true
        this.tiles.forEach((tile: Tile) => {
            if (tile.options.contentType == 'label'){
                return
            }
            tile.options.scene = tile.options.scene || ''
            if (!tile.options.scene) {
                if (tile.options.isRequired == 'true' && !this.entity[tile.options.attrName]) {
                    validPass = false
                } else if (tile.options.isRequired == 'true' && tile.options.valueType == 'int' && Number.isNaN(Number(this.entity[tile.options.attrName]))) { // 123，"123"可通过，"abc"不行
                    validPass = false
                }else if (tile.options.isRequired == 'true' && tile.options.contentType == 'input-number' && !(/^([0-9]{1,3}|999)$/.test(this.entity[tile.options.attrName]))){
                    validPass = false
                }
                return
            }
            if (tile.options.scene.indexOf(this.scene) != -1 || !this.scene || !tile.options.scene) {
                if (tile.options.isRequired == 'true' && !this.entity[tile.options.attrName]) {
                    validPass = false
                } else if (tile.options.isRequired == 'true' && tile.options.valueType == 'int' && Number.isNaN(Number(this.entity[tile.options.attrName]))) {
                    validPass = false
                }else if (tile.options.isRequired == 'true' && tile.options.contentType == 'input-number' && !(/^([0-9]{1,3}|999)$/.test(this.entity[tile.options.attrName]))){
                    validPass = false
                }
            } else {
                return
            }

        })
        return validPass
    }

    formatObjTOArray(jsonData) {
        if (jsonData.file) {
            jsonData.file = _.castArray(jsonData.file)
        }
        if (jsonData.property) {
            jsonData.property = _.castArray(jsonData.property)
        }
        if (jsonData.node) {
            jsonData.node = _.castArray(jsonData.node)
        }
        if (jsonData.block) {
            jsonData.block = _.castArray(jsonData.block)
            jsonData.block.forEach(c => {
                this.formatShowJson(c)
            });
        }
    }

    deleteEmptyFile(jsonData) {
        if (jsonData.file && Array.isArray(jsonData.file)) {
            _.remove(jsonData.file, (c => {
                return !c['size'] && !c['name'] && c.checksum_type != "md5"
            }))
        } else if (jsonData.file && !Array.isArray(jsonData.file)) {
            if (!jsonData.file.size && !jsonData.file.name && jsonData.file.checksum_type != "md5") {
                jsonData.file = []
            }
        }
        if (jsonData.block) {
            if (Array.isArray(jsonData.block)) {
                jsonData.block.forEach(c => {
                    this.deleteEmptyFile(c)
                });
            } else {
                this.deleteEmptyFile(jsonData.block)
            }
        }
    }

    formatArrayItems(jsonData) {
        if (jsonData.file && Array.isArray(jsonData.file) && jsonData.file.length == 1) {
            jsonData.file = jsonData.file[0]
        }
        if (jsonData.property && Array.isArray(jsonData.property) && jsonData.property.length == 1) {
            jsonData.property = jsonData.property[0]
        }
        if (jsonData.block && Array.isArray(jsonData.block) && jsonData.block.length == 1) {
            jsonData.block = jsonData.block[0]
            delete jsonData.block.can_repeat
            this.formatArrayItems(jsonData.block)
        } else if (jsonData.block && Array.isArray(jsonData.block) && jsonData.block.length > 1) {
            jsonData.block.forEach(block => {
                delete block.can_repeat
                this.formatArrayItems(block)
            })
        }
    }

    /**
     * 将单个可重复block的属性多值分解成多个block
     */
    formatTableEntity(jsonData) {
        if (jsonData.block) {
            jsonData.block.forEach((b) => {
                if (b.can_repeat == 'true') {
                    let block = _.cloneDeep(b)
                    let property = {}
                    block.property.forEach(pro => {
                        if (!property[pro.name]) {
                            property[pro.name] = {}
                        }
                        property[pro.name].content = _.cloneDeep(pro.content)
                    })
                    let repeat_block = []
                    for (let key in property) {
                        if (property[key].content) {
                            for (let i = 0; i < property[key].content.length; i++) {
                                if (!repeat_block[i]) {
                                    repeat_block[i] = _.cloneDeep(block)
                                    repeat_block[i].property.forEach(pro => {
                                        pro.content = ''
                                    });
                                }
                                repeat_block[i].property.find(pro => {
                                    return pro.name == key
                                }).content = property[key].content[i]
                            }
                        }
                    }
                    jsonData.block = jsonData.block.concat(repeat_block)
                    _.remove(jsonData.block, (n) => {
                        return n == b
                    })
                    return
                }
                this.formatTableEntity(b)
            })
        }
    }

    formatServiceData = (jsonData) => {
        //根据saveEntity对象，将值填入this.nodes对象中
        for (let key in this.saveEntity) {
            let path = key.replace('.file', '')
            let result = JSONPath.JSONPath({ path: path, json: jsonData, resultType: 'all' })
            if (result[0]) {
                //没有找到匹配值
                if (!this.saveEntity[key]) {
                    result[0].parent[result[0].parentProperty] = this.saveEntity[key]
                    continue
                }
                //匹配值为空
                if (this.saveEntity[key].length == 0) {
                    continue
                }
                //当是文件控件时
                if (isArray(this.saveEntity[key]) && this.saveEntity[key].length > 0 && this.saveEntity[key][0].url) {
                    continue
                }

                //判断是否是时间控件
                let row = this.tiles.find((c:Tile)=>c.options.contentType == 'date' && c.options.attrName == key)
                if (row){
                    //时间格式化
                    result[0].parent[result[0].parentProperty] = this.saveEntity[key] ? moment(this.saveEntity[key]).format("YYYY-MM-DD HH:mm:ss") : ''
                    continue
                }
                result[0].parent[result[0].parentProperty] = this.saveEntity[key]
            } else {

                let path = key.replace('.content', '')
                let result = JSONPath.JSONPath({ path: path, json: jsonData, resultType: 'all' })
                if (result[0]) {
                    //判断是否是时间控件
                    let row = this.tiles.find((c:Tile)=>c.options.contentType == 'date' && c.options.attrName == key)
                    if (row){
                        //时间格式化
                        result[0].value.content = this.saveEntity[key] ? moment(this.saveEntity[key]).format("YYYY-MM-DD HH:mm:ss") : ''
                    }else{
                        result[0].value.content = this.saveEntity[key]
                    }
                }
            }
        }
    }
    uploadFinish({ data, attrName, name, size }) {
        if (!this.entity[attrName]) {
            this.entity[attrName] = []
        }
        let format = name.split('.')
        format = format[format.length - 1]
        this.entity[attrName].push({
            // 'type': attrName,
            'url': 'local:' + data.storagePath,
            'size': size,
            'name': name,
            'checksum_type': "md5",
            'checksum': data.md5,
            'isNew': true,
            'format': format,
            'creation_date': moment(new Date()).format(moment.HTML5_FMT.DATETIME_LOCAL),
            'modify_date': moment(new Date()).format(moment.HTML5_FMT.DATETIME_LOCAL)
        })
    }

    toggleCheckbox(event, tile, attr) {
        if (!this.entity[tile.options.attrName]) {
            this.entity[tile.options.attrName] = []
        } else {
            this.entity[tile.options.attrName] = this.entity[tile.options.attrName].split(',')
        }
        if (event.checked) {
            if (this.entity[tile.options.attrName].indexOf(attr) == -1) {
                this.entity[tile.options.attrName].push(attr)
            }
        } else {
            this.entity[tile.options.attrName].splice(this.entity[tile.options.attrName].indexOf(attr), 1)
        }
        this.entity[tile.options.attrName] = this.entity[tile.options.attrName].join(',')
    }

    async previewDoc(url) {
        let preview_window = window.open('')
        let objectId = this.objectPath + url
        objectId = objectId.replace(/\\/g, '/')
        preview_window.location.href = `${this.environmentBaseUrl}previewDoc?objectId=${objectId}&recordId=${this.id}&objectPath=${this.objectPath}&scene=${this.scene}`
    }

    showProcessIcon(i) {
        let len = this.progressNodes.length
        return (((((i + 1) % 5) == 0 && Math.ceil((i + 1) / 5) % 2 != 0) || (i == len - 1 && Math.ceil((i + 1) / 5) % 2 != 0)) || ((((i + 1) % 5) == 0 && Math.ceil((i + 1) / 5) % 2 == 0) || (i == len - 1 && Math.ceil((i + 1) / 5) % 2 == 0)))
            &&
            (i < this.progressNodes.length - 1)
    }

    initProcess() {
        var i, j, len, len1, num, ref, results, rows;
        this.progressNodes.sort(function (a, b) {
            return parseInt(a.operate_date.toString().replace(/-/g, ''), 10) - parseInt(b.operate_date.toString().replace(/-/g, ''), 10);
        });
        ref = this.progressNodes;
        results = [];
        for (num = j = 0, len1 = ref.length; j < len1; num = ++j) {
            let strI = ((i + 1) / 5).toString()
            rows = ref[num];
            i = num;
            len = this.progressNodes.length;
            if (i == 0) {
                rows["class"] = '_first'
                continue
            }
            if ((i + 1) % 5 === 1 && parseInt(strI) % 2 !== 0) {
                if (i === len - 1) {
                    rows["class"] = 'whole_last_right';
                    continue;
                }
                results.push(rows["class"] = '_last');
            } else if ((i + 1) % 5 === 1 && parseInt(strI) % 2 === 0) {
                if (i === len - 1) {
                    rows["class"] = 'whole_last_left';
                    continue;
                }
                results.push(rows["class"] = '_first');
            } else if ((((i + 1) % 5) === 0 && Math.ceil((i + 1) / 5) % 2 !== 0) || (i === len - 1 && Math.ceil((i + 1) / 5) % 2 !== 0)) {
                results.push(rows["class"] = 'last');
            } else if ((((i + 1) % 5) === 0 && Math.ceil((i + 1) / 5) % 2 === 0) || (i === len - 1 && Math.ceil((i + 1) / 5) % 2 === 0)) {
                results.push(rows["class"] = 'first');
            } else if (parseInt(strI) % 2 === 0) {
                results.push(rows["class"] = 'middle');
            } else {
                results.push(rows["class"] = '_middle');
            }
        }
        return results;
    }

    showProcessDetail(node) {
        let dialogRef = this.dialog.open(ShowProcessDetailDialog, {
            width: '',
            disableClose: true,
            data: {
                info: node
            }
        });
        dialogRef.afterClosed().subscribe(res => {
        });
    }

    validNumberInput(event,value){
        if(this.entity[value] <= 0){
            this.entity[value] = 1
        }
        if(!(/^([0-9]{1,3}|999)$/.test(this.entity[value]))){
            this.entity[value] = 1
        }
    }

    checkNeedProperty() {
        if (!this.getMulModifeProPertyValues) console.warn(ErrorMessage.needGetMulModifeProPertyValues)
        if (!this.getDefaultValue) console.warn(ErrorMessage.getDefaultValue)
        if (!this._DepartmentManageServiceGetList) console.warn(ErrorMessage._DepartmentManageServiceGetList)
        if (!this._chooseUsersAccessServiceGetRoleList) console.warn(ErrorMessage._chooseUsersAccessServiceGetRoleList)
        if (!this._chooseUsersAccessServiceGetUserByDept) console.warn(ErrorMessage._chooseUsersAccessServiceGetUserByDept)
        if (!this._chooseUsersAccessServiceGetUserByRole) console.warn(ErrorMessage._chooseUsersAccessServiceGetUserByRole)
        if (!this._dwClassManageServiceGetMetadataCategoryInfo || !this._dwClassManageServiceGetMetaSysClassList) console.warn(ErrorMessage._dwClassManageServiceGetMetadataCategoryInfo)
        if (!this.environmentBaseUrl) console.warn(ErrorMessage.environmentBaseUrl)
        if (!this.ApiUrl) console.warn(ErrorMessage.ApiUrl)
        if (!this.baseUrl) console.warn(ErrorMessage.baseUrl)
        if (!this.AuthenticationService) console.warn(ErrorMessage.AuthenticationService)
        if (!this.objectPath) console.warn(ErrorMessage.ObjectPath)
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (!this.showTemplateXml) {
            return
        }
        if (this.jsonMetadataTemplate && changes.jsonMetadataTemplate) {
            this.tiles = []
            this.entity = {}
            this.checkNeedProperty()
            this.getTemplateModule()
        }

    }

}



