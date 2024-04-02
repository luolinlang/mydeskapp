modules.exports = {
    "packagerConfig": {
        "icon": "./images/icon"
    },
    "publishers": [
        {
            "name": "@electron-forge/publisher-github",
            "config": {
                "repository": {
                    "owner": "github-user-name",
                    "name": "github-repo-name"
                },
                "prerelease": false,
                "draft": true
            }
        }
    ],
    "makers": [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "iconUrl": "./images/icon.ico",
                "setupIcon": "./images/icon.ico"
            }
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {
                "options": {
                    "icon": "./images/icon.png"
                }
            }
        }
    ]
}