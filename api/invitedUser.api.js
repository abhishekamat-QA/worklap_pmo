export class InvitedUserApi {

    constructor(request) {

        this.request = request;

        this.baseUrl =
            'https://wlqa.testingmonkey.com';
    }


    async getUserKey(email) {

        if (!email) {
            throw new Error(
                'Email is required to fetch user key.'
            );
        }

        const response =
            await this.request.get(
                `${this.baseUrl}/api/auth/qa/getnada-user-key`,
                {
                    params: {
                        email
                    }
                }
            );


        const body =
            await response.json();


        console.log(
            'User-key API response:',
            JSON.stringify(body, null, 2)
        );


        if (!response.ok()) {

            throw new Error(
                `User-key API failed with status ${response.status()} for ${email}`
            );
        }


        const userKey =
            body?.response?.userKey;


        return userKey || null;
    }
}