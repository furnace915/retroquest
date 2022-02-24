/*
 * Copyright (c) 2021 Ford Motor Company
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
import { Thought } from '../../domain/thought';
import { ColumnTitle } from '../../../../react/types/ColumnTitle';

@Injectable()
export class ThoughtService {
  constructor(private http: HttpClient, private dataService: DataService) {}

  fetchThoughts(teamId: string): Observable<Array<Thought>> {
    return this.http.get<Array<Thought>>(`/api/team/${teamId}/thoughts`);
  }

  addThought(thought: Thought): void {
    this.http
      .post(`/api/team/${this.dataService.team.id}/thought`, JSON.stringify(thought), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .subscribe();
  }

  heartThought(thought: Thought): void {
    this.http.put(`/api/team/${this.dataService.team.id}/thought/${thought.id}/heart`, {}).subscribe();
  }

  updateDiscussionStatus(thought: Thought, discussed: boolean): void {
    this.http
      .put(
        `/api/team/${this.dataService.team.id}/thought/${thought.id}/discuss`,
        JSON.stringify({
          discussed,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .subscribe();
  }

  moveThought(thoughtId: Thought['id'], columnId: ColumnTitle['id']): void {
    this.http
      .put(
        `/api/team/${this.dataService.team.id}/thought/${thoughtId}/topic`,
        JSON.stringify({
          columnId,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .subscribe();
  }

  updateMessage(thought: Thought, newMessage: string): void {
    this.http
      .put(
        `/api/team/${this.dataService.team.id}/thought/${thought.id}/message`,
        JSON.stringify({
          message: newMessage,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .subscribe();
  }

  deleteThought(thought: Thought): void {
    this.http.delete(`/api/team/${this.dataService.team.id}/thought/${thought.id}`).subscribe();
  }
}
