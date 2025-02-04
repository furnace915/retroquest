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

import { getLoginPagePathWithTeamId } from '../../src/RouteConstants';
import { FEEDBACK_API_PATH } from '../../src/Services/Api/ApiConstants';
import { TOKEN_KEY } from '../../src/Services/CookieService';
import { getTeamCredentials } from '../support/helpers';
import Topic from '../support/types/Topic';
import Chainable = Cypress.Chainable;

describe('Retro Member Journey', () => {
	let teamCredentials;

	beforeEach(() => {
		teamCredentials = getTeamCredentials();
		cy.createTeamAndLogin(teamCredentials);
	});

	it('Add thoughts to each column', () => {
		cy.log('**Should have "Happy" column header in green**');
		const green = 'rgb(46, 204, 113)';
		cy.findByText('Happy')
			.should('exist')
			.parent()
			.should('have.css', 'background-color', green);

		cy.get('[data-testid=retroColumn__happy]').as('happyColumn');

		const happyThoughts = ['Loved our communication', 'Great team dynamic'];
		shouldAddHappyThoughts(happyThoughts);

		cy.log('*Should have "Confused" column header in blue*');
		const blue = 'rgb(52, 152, 219)';
		cy.findByText('Confused')
			.should('exist')
			.parent()
			.should('have.css', 'background-color', blue);

		cy.get('[data-testid=retroColumn__confused]').as('confusedColumn');

		const confusedThought = "What's going on with zyx";
		cy.enterThought(Topic.CONFUSED, confusedThought);
		cy.confirmNumberOfThoughtsInColumn(Topic.CONFUSED, 1);

		cy.log('*Should have "Sad" column header in red*');
		const red = 'rgb(231, 76, 60)';
		cy.findByText('Sad')
			.should('exist')
			.parent()
			.should('have.css', 'background-color', red);

		cy.get('[data-testid=retroColumn__unhappy]').as('sadColumn');

		const unhappyThought = "I don't like how many meetings we have";
		cy.enterThought(Topic.UNHAPPY, unhappyThought);
		cy.confirmNumberOfThoughtsInColumn(Topic.UNHAPPY, 1);

		cy.log('**On page reload all Happy thoughts should still be there**');
		cy.reload();
		cy.confirmNumberOfThoughtsInColumn(Topic.HAPPY, 2);
		cy.confirmNumberOfThoughtsInColumn(Topic.UNHAPPY, 1);
		cy.confirmNumberOfThoughtsInColumn(Topic.CONFUSED, 1);
	});

	it('Upvote thought', () => {
		shouldAddHappyThoughts(['Happy Thought']);

		shouldUpvoteFirstItemInHappyColumn(1);
		shouldUpvoteFirstItemInHappyColumn(2);
		cy.confirmNumberOfThoughtsInColumn(Topic.HAPPY, 1);
	});

	it('Edit thought', () => {
		const currentThought = 'Thought to edit';
		shouldAddHappyThoughts([currentThought]);

		cy.log(`**Edit thought: ${currentThought}**`);
		const updatedThought = `${currentThought} - updated`;
		getRetroItemByMessage(currentThought)
			.find('[data-testid=editButton]')
			.type(`${updatedThought}{enter}`);
		cy.findByText(updatedThought).should('exist');
		cy.confirmNumberOfThoughtsInColumn(Topic.HAPPY, 1);
	});

	it('Move thought between columns', () => {
		cy.intercept(
			'PUT',
			`/api/team/${teamCredentials.teamId}/thought/*/column-id`
		).as('moveRetroItem');

		const thoughtToMove = 'Move me!';
		const thoughtNotToMove = 'Do not move me';
		shouldAddHappyThoughts([thoughtToMove, thoughtNotToMove]);

		const green = 'rgb(46, 204, 113)';
		const blue = 'rgb(52, 152, 219)';
		const red = 'rgb(231, 76, 60)';
		const keycodes = {
			space: 32,
			arrowRight: 39,
			arrowLeft: 37,
		};

		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('[data-testid=draggableRetroItem-happy-1]')
			.should('contain.text', thoughtToMove)
			.focus()
			.trigger('keydown', { keyCode: keycodes.space })
			.should('have.css', 'box-shadow', `${green} 0px 0px 0px 2px`)
			.trigger('keydown', { keyCode: keycodes.arrowRight, force: true })
			.wait(200)
			.trigger('keydown', { keyCode: keycodes.space, force: true });

		cy.wait('@moveRetroItem');

		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('[data-testid=draggableRetroItem-confused-1]')
			.should('contain.text', thoughtToMove)
			.focus()
			.trigger('keydown', { keyCode: keycodes.space })
			.should('have.css', 'box-shadow', `${blue} 0px 0px 0px 2px`)
			.trigger('keydown', { keyCode: keycodes.arrowRight, force: true })
			.wait(200)
			.trigger('keydown', { keyCode: keycodes.space, force: true });

		cy.wait('@moveRetroItem');

		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('[data-testid=draggableRetroItem-unhappy-1]')
			.should('contain.text', thoughtToMove)
			.focus()
			.trigger('keydown', { keyCode: keycodes.space })
			.should('have.css', 'box-shadow', `${red} 0px 0px 0px 2px`)
			.trigger('keydown', { keyCode: keycodes.arrowLeft, force: true })
			.wait(200)
			.trigger('keydown', { keyCode: keycodes.space, force: true });

		cy.wait('@moveRetroItem');

		cy.get('[data-testid=draggableRetroItem-confused-1]')
			.should('contain.text', thoughtToMove)
			.focus()
			.trigger('keydown', { keyCode: keycodes.space })
			.should('have.css', 'box-shadow', `${blue} 0px 0px 0px 2px`);
	});

	it('Delete thought', () => {
		const thoughtToDelete = 'Delete Me!';
		const thoughtNotToDelete = 'Do not delete';
		shouldAddHappyThoughts([thoughtToDelete, thoughtNotToDelete]);

		cy.log(`**Deleting happy thought ${thoughtToDelete}**`);
		getRetroItemByMessage(thoughtToDelete)
			.find(`[data-testid=deleteButton]`)
			.click();
		cy.get('[data-testid=deleteColumnItem]').contains('Yes').click();

		cy.findByText(thoughtNotToDelete).should('exist');
		cy.findByText(thoughtToDelete).should('not.exist');
		cy.confirmNumberOfThoughtsInColumn(Topic.HAPPY, 1);
	});

	it('Feedback Button', () => {
		const modalText = 'How can we improve RetroQuest?';
		cy.intercept('POST', FEEDBACK_API_PATH).as('postFeedbackEndpoint');

		cy.findByText('Give Feedback').as('giveFeedbackButton').click();

		cy.get('[data-testid=feedbackForm]')
			.as('modal')
			.should('contain', modalText);

		cy.get('@modal').findByText('Cancel').click();
		ensureModalIsClosed();
		cy.get('@postFeedbackEndpoint')
			.its('response.statusCode')
			.should('eq', null);

		cy.get('@giveFeedbackButton').click();
		ensureModalIsOpen();

		cy.get('@modal').find('[data-testid=feedback-star-5-label]').click();
		cy.get('@modal').findByLabelText('Comments*').type('Doing great!');
		cy.get('@modal').findByLabelText('Feedback Email').focus().type('a@b.c');

		cy.findByText('Send!').click();
		ensureModalIsClosed();
		cy.get('@postFeedbackEndpoint')
			.its('response.statusCode')
			.should('eq', 201);
	});

	it('Navigate between columns on mobile', () => {
		cy.viewport(414, 736);

		const happyColumn = 'Happy';
		const confusedColumn = 'Confused';
		const sadColumn = 'Sad';
		const actionItemsColumn = 'Action Items';

		cy.findByText(happyColumn).should('be.visible');
		cy.findByText(confusedColumn).should('not.be.visible');
		cy.findByText(sadColumn).should('not.be.visible');
		cy.findByText(actionItemsColumn).should('not.be.visible');

		cy.get('[data-testid=mobileColumnNav-3]').click();

		cy.findByText(happyColumn).should('not.be.visible');
		cy.findByText(confusedColumn).should('not.be.visible');
		cy.findByText(sadColumn).should('not.be.visible');
		cy.findByText(actionItemsColumn).should('be.visible');

		cy.get('[data-testid=mobileColumnNav-2]').click();

		cy.findByText(happyColumn).should('not.be.visible');
		cy.findByText(confusedColumn).should('not.be.visible');
		cy.findByText(sadColumn).should('be.visible');
		cy.findByText(actionItemsColumn).should('not.be.visible');

		cy.get('[data-testid=mobileColumnNav-1]').click();

		cy.findByText(happyColumn).should('not.be.visible');
		cy.findByText(confusedColumn).should('be.visible');
		cy.findByText(sadColumn).should('not.be.visible');
		cy.findByText(actionItemsColumn).should('not.be.visible');

		cy.get('[data-testid=mobileColumnNav-0]').click();

		cy.findByText(happyColumn).should('be.visible');
		cy.findByText(confusedColumn).should('not.be.visible');
		cy.findByText(sadColumn).should('not.be.visible');
		cy.findByText(actionItemsColumn).should('not.be.visible');
	});

	describe('Settings', () => {
		beforeEach(() => {
			cy.get('[data-testid=settingsButton]').click();
			cy.findAllByText('Settings').eq(1).should('exist');

			cy.findByText('Styles').as('stylesTab');
			cy.findByText('Account').as('accountTab');
		});

		it('Styles Tab: Change theme between light mode and dark', () => {
			cy.get('@stylesTab').as('stylesTab').should('have.class', 'selected');
			cy.get('@accountTab').should('not.have.class', 'selected');

			const darkThemeClass = '.dark-theme';
			cy.get(darkThemeClass).should('not.exist');

			cy.findByAltText('Dark Theme').click();
			cy.get(darkThemeClass).should('exist');

			cy.findByAltText('Light Theme').click();
			cy.get(darkThemeClass).should('not.exist');
		});

		it('Account Tab: Log out', () => {
			cy.get('@accountTab').click().should('have.class', 'selected');
			cy.get('@stylesTab').should('not.have.class', 'selected');

			cy.findByText('Logout').click();

			cy.log('**Should be on Login page with pre-populated team name**');

			const LoginPagePathWithTeamId =
				Cypress.config().baseUrl +
				getLoginPagePathWithTeamId(teamCredentials.teamId);
			cy.url().should('eq', LoginPagePathWithTeamId);

			cy.contains('Sign in to your Team!').should('exist');

			cy.getCookie(TOKEN_KEY).should('not.exist');
		});
	});

	const ensureModalIsOpen = () => {
		cy.get('@modal').should('exist');
	};

	const ensureModalIsClosed = () => {
		cy.get('@modal').should('not.exist');
	};
});

const getRetroItemByMessage = (message: string): Chainable =>
	cy.findByText(message).closest(`[data-testid=retroItem]`);
const getHappyColumnItems = () =>
	cy.get('[data-testid=retroColumn__happy]').find(`[data-testid=retroItem]`);

function shouldUpvoteFirstItemInHappyColumn(expectedStarCount: number) {
	cy.log(`**Starring first happy thought**`);
	const starCountSelector = '[data-testid=retroItem-upvote]';
	getHappyColumnItems().first().find(starCountSelector).click();
	cy.log('**The first thought in the happy column should have two stars**');
	getHappyColumnItems()
		.first()
		.find(starCountSelector)
		.should('have.contain', expectedStarCount);
}

function shouldAddHappyThoughts(happyThoughts: string[]) {
	happyThoughts.forEach((happyThought, index) => {
		cy.enterThought(Topic.HAPPY, happyThought);
		cy.findByText(happyThought).should('exist');
		cy.confirmNumberOfThoughtsInColumn(Topic.HAPPY, index + 1);
	});
}
