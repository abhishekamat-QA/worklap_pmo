import fs from 'fs';
import path from 'path';

const filePath = path.resolve(
    './test-data/invitedUsers.json'
);


// =========================================================
// READ INVITED USERS
// =========================================================

export function readInvitedUsers() {

    if (!fs.existsSync(filePath)) {
        return [];
    }

    const content =
        fs.readFileSync(
            filePath,
            'utf-8'
        );

    if (!content.trim()) {
        return [];
    }

    return JSON.parse(content);
}


// =========================================================
// SAVE ALL INVITED USERS
// =========================================================

export function saveInvitedUsers(
    invitedUsers
) {

    if (!Array.isArray(invitedUsers)) {
        throw new Error(
            'invitedUsers must be an array.'
        );
    }

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            invitedUsers,
            null,
            4
        ),
        'utf-8'
    );

    console.log(
        `Invited users saved to: ${filePath}`
    );
}


// =========================================================
// UPDATE ACCOUNT CREATED
// =========================================================

export function updateAccountCreated(
    email,
    accountCreated
) {

    const invitedUsers =
        readInvitedUsers();

    const userIndex =
        invitedUsers.findIndex(
            user =>
                user.email === email
        );

    if (userIndex === -1) {

        throw new Error(
            `User not found in invitedUsers.json: ${email}`
        );
    }

    invitedUsers[userIndex] = {
        ...invitedUsers[userIndex],
        accountCreated
    };

    saveInvitedUsers(
        invitedUsers
    );

    console.log(
        `Updated accountCreated=${accountCreated} for ${email}`
    );
}