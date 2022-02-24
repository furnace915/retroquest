/*
 * Copyright (c) 2022 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DataService } from '../../data.service';
import { ActionItem } from '../../domain/action-item';

@Injectable()
export class ActionItemService {
  constructor(private http: HttpClient, private dataService: DataService) {}

  fetchActionItems(teamId): Observable<Array<ActionItem>> {
    return this.http.get<Array<ActionItem>>(`/api/team/${teamId}/action-item?archived=false`);
  }

  fetchArchivedActionItems(teamId): Observable<Array<ActionItem>> {
    return this.http.get<Array<ActionItem>>(`/api/team/${teamId}/action-item?archived=true`);
  }

  addActionItem(actionItem: ActionItem): void {
    this.http
      .post(`/api/team/${this.dataService.team.id}/action-item`, JSON.stringify(actionItem), {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe();
  }

  updateTask(actionItem: ActionItem, updatedTask: string): void {
    this.http
      .put(
        `/api/team/${this.dataService.team.id}/action-item/${actionItem.id}/task`,
        JSON.stringify({ task: updatedTask }),
        { headers: { 'Content-Type': 'application/json' } }
      )
      .subscribe();
  }

  updateAssignee(actionItem: ActionItem, assignee: string): void {
    this.http
      .put(
        `/api/team/${this.dataService.team.id}/action-item/${actionItem.id}/assignee`,
        JSON.stringify({ assignee }),
        { headers: { 'Content-Type': 'application/json' } }
      )
      .subscribe();
  }

  updateCompleted(actionItem: ActionItem, completed: boolean): void {
    this.http
      .put(
        `/api/team/${this.dataService.team.id}/action-item/${actionItem.id}/completed`,
        JSON.stringify({ completed }),
        { headers: { 'Content-Type': 'application/json' } }
      )
      .subscribe();
  }

  updateArchived(actionItem: ActionItem, archived: boolean) {
    this.http
      .put(
        `/api/team/${this.dataService.team.id}/action-item/${actionItem.id}/archived`,
        JSON.stringify({ archived }),
        { headers: { 'Content-Type': 'application/json' } }
      )
      .subscribe();
  }

  deleteActionItem(actionItem: ActionItem): void {
    this.http.delete(`/api/team/${this.dataService.team.id}/action-item/${actionItem.id}`).subscribe();
  }

  archiveActionItems(archivedActionItems: Array<ActionItem>) {
    archivedActionItems.forEach((actionItem) => {
      this.updateArchived(actionItem, true);
    });
  }
}
