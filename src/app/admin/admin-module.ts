import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';


import { SharedModule } from '../shared/shared-module';
import { ManageVideo } from './dialog/manage-video/manage-video';
import { VideoList } from './video-list/video-list';
import { UserList } from './user-list/user-list';
import { ManageUser } from './manage-user/manage-user';


@NgModule({
  declarations: [
    ManageVideo,
    VideoList,
    UserList,
    ManageUser
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
  ]
})
export class AdminModule { }
