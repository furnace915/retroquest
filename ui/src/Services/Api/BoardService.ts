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

import axios from 'axios';

import Board from '../../Types/Board';

import getAuthConfig from './getAuthConfig';

const BoardService = {
	archiveRetro(teamId: string): Promise<void> {
		const url = `/api/team/${teamId}/end-retro`;
		return axios.put(url, getAuthConfig());
	},

	getBoards(teamId: string, pageIndex: number): Promise<Board[]> {
		const url = `/api/team/${teamId}/boards?pageIndex=${pageIndex}`;
		return axios.get(url, getAuthConfig()).then((response) => response.data);
	},
};

export default BoardService;
