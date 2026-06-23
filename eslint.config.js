import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/typescript-estree";

export default [
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "sort-imports": [
                "error",
                {
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                    memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
                },
            ],
        },
    },
];
