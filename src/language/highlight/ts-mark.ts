import { SyntaxKind } from "byots";
import { comment, controlKeyword, identifier, keyword, number, operatorKeyword, other, punctuation, regexp, string, type } from "./mark";

const enum Unset {
//     Unknown,
//     EndOfFileToken,
//     NewLineTrivia,
//     WhitespaceTrivia,
//     // We detect and preserve #! on the first line
//     ShebangTrivia,
//     // We detect and provide better error recovery when we encounter a git merge marker.  This
//     // allows us to edit files with git-conflict markers in them in a much more pleasant manner.
//     ConflictMarkerTrivia,
//     /** Only the JSDoc scanner produces BacktickToken. The normal scanner produces NoSubstitutionTemplateLiteral and related kinds. */
//     BacktickToken,
//     /** Only the JSDoc scanner produces HashToken. The normal scanner produces PrivateIdentifier. */
//     HashToken,

//     // Parse tree nodes

//     // Names
//     QualifiedName,
//     ComputedPropertyName,
//     // Signature elements
//     TypeParameter,
//     Parameter,
//     Decorator,
//     // TypeMember
//     PropertySignature,
//     PropertyDeclaration,
//     MethodSignature,
//     MethodDeclaration,
//     ClassStaticBlockDeclaration,
//     Constructor,
//     GetAccessor,
//     SetAccessor,
//     CallSignature,
//     ConstructSignature,
//     IndexSignature,
//     // Type
//     TypePredicate,
//     TypeReference,
//     FunctionType,
//     ConstructorType,
//     TypeQuery,
//     TypeLiteral,
//     ArrayType,
//     TupleType,
//     OptionalType,
//     RestType,
//     UnionType,
//     IntersectionType,
//     ConditionalType,
//     InferType,
//     ParenthesizedType,
//     ThisType,
//     TypeOperator,
//     IndexedAccessType,
//     MappedType,
//     LiteralType,
//     NamedTupleMember,
//     TemplateLiteralType,
//     TemplateLiteralTypeSpan,
//     ImportType,
//     // Binding patterns
//     ObjectBindingPattern,
//     ArrayBindingPattern,
//     BindingElement,
//     // Expression
//     ArrayLiteralExpression,
//     ObjectLiteralExpression,
//     PropertyAccessExpression,
//     ElementAccessExpression,
//     CallExpression,
//     NewExpression,
//     TaggedTemplateExpression,
//     TypeAssertionExpression,
//     ParenthesizedExpression,
//     FunctionExpression,
//     ArrowFunction,
//     DeleteExpression,
//     TypeOfExpression,
//     VoidExpression,
//     AwaitExpression,
//     PrefixUnaryExpression,
//     PostfixUnaryExpression,
//     BinaryExpression,
//     ConditionalExpression,
//     TemplateExpression,
//     YieldExpression,
//     SpreadElement,
//     ClassExpression,
//     OmittedExpression,
//     ExpressionWithTypeArguments,
//     AsExpression,
//     NonNullExpression,
//     MetaProperty,
//     SyntheticExpression,

//     // Misc
//     TemplateSpan,
//     SemicolonClassElement,
//     // Element
//     Block,
//     EmptyStatement,
//     VariableStatement,
//     ExpressionStatement,
//     IfStatement,
//     DoStatement,
//     WhileStatement,
//     ForStatement,
//     ForInStatement,
//     ForOfStatement,
//     ContinueStatement,
//     BreakStatement,
//     ReturnStatement,
//     WithStatement,
//     SwitchStatement,
//     LabeledStatement,
//     ThrowStatement,
//     TryStatement,
//     DebuggerStatement,
//     VariableDeclaration,
//     VariableDeclarationList,
//     FunctionDeclaration,
//     ClassDeclaration,
//     InterfaceDeclaration,
//     TypeAliasDeclaration,
//     EnumDeclaration,
//     ModuleDeclaration,
//     ModuleBlock,
//     CaseBlock,
//     NamespaceExportDeclaration,
//     ImportEqualsDeclaration,
//     ImportDeclaration,
//     ImportClause,
//     NamespaceImport,
//     NamedImports,
//     ImportSpecifier,
//     ExportAssignment,
//     ExportDeclaration,
//     NamedExports,
//     NamespaceExport,
//     ExportSpecifier,
//     MissingDeclaration,

//     // Module references
//     ExternalModuleReference,

//     // JSX
//     JsxElement,
//     JsxSelfClosingElement,
//     JsxOpeningElement,
//     JsxClosingElement,
//     JsxFragment,
//     JsxOpeningFragment,
//     JsxClosingFragment,
//     JsxAttribute,
//     JsxAttributes,
//     JsxSpreadAttribute,
//     JsxExpression,

//     // Clauses
//     CaseClause,
//     DefaultClause,
//     HeritageClause,
//     CatchClause,
//     AssertClause,
//     AssertEntry,
//     ImportTypeAssertionContainer,

//     // Property assignments
//     PropertyAssignment,
//     ShorthandPropertyAssignment,
//     SpreadAssignment,

//     // Enum
//     EnumMember,
//     // Unparsed
//     UnparsedPrologue,
//     UnparsedPrepend,
//     UnparsedText,
//     UnparsedInternalText,
//     UnparsedSyntheticReference,

//     // Top-level nodes
//     SourceFile,
//     Bundle,
//     UnparsedSource,
//     InputFiles,

//     // JSDoc nodes
//     JSDocTypeExpression,
//     JSDocNameReference,
//     JSDocMemberName, // C#p
//     JSDocAllType, // The * type
//     JSDocUnknownType, // The ? type
//     JSDocNullableType,
//     JSDocNonNullableType,
//     JSDocOptionalType,
//     JSDocFunctionType,
//     JSDocVariadicType,
//     JSDocNamepathType, // https://jsdoc.app/about-namepaths.html
//     /** @deprecated Use SyntaxKind.JSDoc */
//     JSDocComment,
//     JSDocText,
//     JSDocTypeLiteral,
//     JSDocSignature,
//     JSDocLink,
//     JSDocLinkCode,
//     JSDocLinkPlain,
//     JSDocTag,
//     JSDocAugmentsTag,
//     JSDocImplementsTag,
//     JSDocAuthorTag,
//     JSDocDeprecatedTag,
//     JSDocClassTag,
//     JSDocPublicTag,
//     JSDocPrivateTag,
//     JSDocProtectedTag,
//     JSDocReadonlyTag,
//     JSDocOverrideTag,
//     JSDocCallbackTag,
//     JSDocEnumTag,
//     JSDocParameterTag,
//     JSDocReturnTag,
//     JSDocThisTag,
//     JSDocTypeTag,
//     JSDocTemplateTag,
//     JSDocTypedefTag,
//     JSDocSeeTag,
//     JSDocPropertyTag,

//     // Synthesized list
//     SyntaxList,

//     // Transformation nodes
//     NotEmittedStatement,
//     PartiallyEmittedExpression,
//     CommaListExpression,
//     MergeDeclarationMarker,
//     EndOfDeclarationMarker,
//     SyntheticReferenceExpression,

//     // Enum value count
//     Count,

//     // Markers
//     FirstAssignment = EqualsToken,
//     LastAssignment = CaretEqualsToken,
//     FirstCompoundAssignment = PlusEqualsToken,
//     LastCompoundAssignment = CaretEqualsToken,
//     FirstReservedWord = BreakKeyword,
//     LastReservedWord = WithKeyword,
//     FirstKeyword = BreakKeyword,
//     LastKeyword = OfKeyword,
//     FirstFutureReservedWord = ImplementsKeyword,
//     LastFutureReservedWord = YieldKeyword,
//     FirstTypeNode = TypePredicate,
//     LastTypeNode = ImportType,
//     FirstPunctuation = OpenBraceToken,
//     LastPunctuation = CaretEqualsToken,
//     FirstToken = Unknown,
//     LastToken = LastKeyword,
//     FirstTriviaToken = SingleLineCommentTrivia,
//     LastTriviaToken = ConflictMarkerTrivia,
//     FirstLiteralToken = NumericLiteral,
//     LastLiteralToken = NoSubstitutionTemplateLiteral,
//     FirstTemplateToken = NoSubstitutionTemplateLiteral,
//     LastTemplateToken = TemplateTail,
//     FirstBinaryOperator = LessThanToken,
//     LastBinaryOperator = CaretEqualsToken,
//     FirstStatement = VariableStatement,
//     LastStatement = DebuggerStatement,
//     FirstNode = QualifiedName,
//     FirstJSDocNode = JSDocTypeExpression,
//     LastJSDocNode = JSDocPropertyTag,
//     FirstJSDocTagNode = JSDocTag,
//     LastJSDocTagNode = JSDocPropertyTag,
//     /* @internal */ FirstContextualKeyword = AbstractKeyword,
//     /* @internal */ LastContextualKeyword = OfKeyword,
//     JSDoc = JSDocComment,
}

export function getTSTokenMark(token: SyntaxKind) {
    switch (token) {
    case SyntaxKind.SingleLineCommentTrivia:
    case SyntaxKind.MultiLineCommentTrivia:
        return comment;
    // Literals
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.BigIntLiteral:
        return number;
    case SyntaxKind.StringLiteral:
        return string;
    case SyntaxKind.JsxText:
    case SyntaxKind.JsxTextAllWhiteSpaces:
    case SyntaxKind.RegularExpressionLiteral:
        return regexp;
    case SyntaxKind.NoSubstitutionTemplateLiteral:
    // Pseudo-literals
    case SyntaxKind.TemplateHead:
    case SyntaxKind.TemplateMiddle:
    case SyntaxKind.TemplateTail:
        return string;
    // Punctuation
    case SyntaxKind.OpenBraceToken:
    case SyntaxKind.CloseBraceToken:
    case SyntaxKind.OpenParenToken:
    case SyntaxKind.CloseParenToken:
    case SyntaxKind.OpenBracketToken:
    case SyntaxKind.CloseBracketToken:
        return punctuation;
    case SyntaxKind.DotToken:
    case SyntaxKind.DotDotDotToken:
    case SyntaxKind.SemicolonToken:
    case SyntaxKind.CommaToken:
    case SyntaxKind.QuestionDotToken:
    case SyntaxKind.LessThanToken:
    case SyntaxKind.LessThanSlashToken:
    case SyntaxKind.GreaterThanToken:
    case SyntaxKind.LessThanEqualsToken:
    case SyntaxKind.GreaterThanEqualsToken:
    case SyntaxKind.EqualsEqualsToken:
    case SyntaxKind.ExclamationEqualsToken:
    case SyntaxKind.EqualsEqualsEqualsToken:
    case SyntaxKind.ExclamationEqualsEqualsToken:
    case SyntaxKind.PlusToken:
    case SyntaxKind.MinusToken:
    case SyntaxKind.AsteriskToken:
    case SyntaxKind.AsteriskAsteriskToken:
    case SyntaxKind.SlashToken:
    case SyntaxKind.PercentToken:
    case SyntaxKind.PlusPlusToken:
    case SyntaxKind.MinusMinusToken:
    case SyntaxKind.LessThanLessThanToken:
    case SyntaxKind.GreaterThanGreaterThanToken:
    case SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
    case SyntaxKind.AmpersandToken:
    case SyntaxKind.BarToken:
    case SyntaxKind.CaretToken:
    case SyntaxKind.ExclamationToken:
    case SyntaxKind.TildeToken:
    case SyntaxKind.AmpersandAmpersandToken:
    case SyntaxKind.BarBarToken:
    case SyntaxKind.QuestionToken:
    case SyntaxKind.ColonToken:
    case SyntaxKind.AtToken:
    case SyntaxKind.QuestionQuestionToken:
    // Assignments
    case SyntaxKind.EqualsToken:
    case SyntaxKind.PlusEqualsToken:
    case SyntaxKind.MinusEqualsToken:
    case SyntaxKind.AsteriskEqualsToken:
    case SyntaxKind.AsteriskAsteriskEqualsToken:
    case SyntaxKind.SlashEqualsToken:
    case SyntaxKind.PercentEqualsToken:
    case SyntaxKind.LessThanLessThanEqualsToken:
    case SyntaxKind.GreaterThanGreaterThanEqualsToken:
    case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
    case SyntaxKind.AmpersandEqualsToken:
    case SyntaxKind.BarEqualsToken:
    case SyntaxKind.BarBarEqualsToken:
    case SyntaxKind.AmpersandAmpersandEqualsToken:
    case SyntaxKind.QuestionQuestionEqualsToken:
    case SyntaxKind.CaretEqualsToken:
        return operatorKeyword;
    // Identifiers and PrivateIdentifiers
    case SyntaxKind.Identifier:
    case SyntaxKind.PrivateIdentifier:
        return identifier;
    case SyntaxKind.EqualsGreaterThanToken:

    case SyntaxKind.ClassKeyword:
    case SyntaxKind.ConstKeyword:
    case SyntaxKind.DebuggerKeyword:
    case SyntaxKind.DeleteKeyword:
    case SyntaxKind.EnumKeyword:
    case SyntaxKind.ExtendsKeyword:
    case SyntaxKind.FalseKeyword:
    case SyntaxKind.FunctionKeyword:
    case SyntaxKind.InKeyword:
    case SyntaxKind.InstanceOfKeyword:
    case SyntaxKind.NewKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.SuperKeyword:
    case SyntaxKind.ThisKeyword:
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.TypeOfKeyword:
    case SyntaxKind.VarKeyword:
    case SyntaxKind.VoidKeyword:
    // Strict mode reserved words
    case SyntaxKind.ImplementsKeyword:
    case SyntaxKind.InterfaceKeyword:
    case SyntaxKind.LetKeyword:
    case SyntaxKind.PackageKeyword:
    case SyntaxKind.PrivateKeyword:
    case SyntaxKind.ProtectedKeyword:
    case SyntaxKind.PublicKeyword:
    case SyntaxKind.StaticKeyword:
    // Contextual keywords
    case SyntaxKind.AbstractKeyword:
    case SyntaxKind.AsyncKeyword:
    case SyntaxKind.ConstructorKeyword:
    case SyntaxKind.DeclareKeyword:
    case SyntaxKind.GetKeyword:
    case SyntaxKind.InferKeyword:
    case SyntaxKind.KeyOfKeyword:
    case SyntaxKind.ModuleKeyword:
    case SyntaxKind.NamespaceKeyword:
    case SyntaxKind.SetKeyword:
    case SyntaxKind.TypeKeyword:
    case SyntaxKind.UndefinedKeyword:
    case SyntaxKind.GlobalKeyword:
    case SyntaxKind.OverrideKeyword:
        return keyword;
    case SyntaxKind.BreakKeyword:
    case SyntaxKind.CaseKeyword:
    case SyntaxKind.CatchKeyword:
    case SyntaxKind.ContinueKeyword:
    case SyntaxKind.DefaultKeyword:
    case SyntaxKind.DoKeyword:
    case SyntaxKind.ElseKeyword:
    case SyntaxKind.ExportKeyword:
    case SyntaxKind.FinallyKeyword:
    case SyntaxKind.ForKeyword:
    case SyntaxKind.IfKeyword:
    case SyntaxKind.ImportKeyword:
    case SyntaxKind.ReturnKeyword:
    case SyntaxKind.SwitchKeyword:
    case SyntaxKind.ThrowKeyword:
    case SyntaxKind.TryKeyword:
    case SyntaxKind.WhileKeyword:
    case SyntaxKind.WithKeyword:
    // Strict mode reserved words
    case SyntaxKind.YieldKeyword:
    // Contextual keywords
    case SyntaxKind.AsKeyword:
    case SyntaxKind.AssertsKeyword:
    case SyntaxKind.AssertKeyword:
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.AwaitKeyword:
    case SyntaxKind.IntrinsicKeyword:
    case SyntaxKind.IsKeyword:
    case SyntaxKind.RequireKeyword:
    case SyntaxKind.UniqueKeyword:
    case SyntaxKind.FromKeyword:
    case SyntaxKind.OfKeyword: // L
        return controlKeyword;
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.NeverKeyword:
    case SyntaxKind.ReadonlyKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.ObjectKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.SymbolKeyword:
    case SyntaxKind.UnknownKeyword:
    case SyntaxKind.BigIntKeyword:
        return type;
    default:
        return other;
    }
}
