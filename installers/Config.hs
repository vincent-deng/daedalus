{-# LANGUAGE LambdaCase          #-}
{-# LANGUAGE NoImplicitPrelude   #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE RecordWildCards     #-}

{-# LANGUAGE TypeOperators     #-}
{-# LANGUAGE DataKinds         #-}
module Config
  ( generateConfig
  , Request(..)
  , OS(..), Cluster(..), Config(..)
  , flag
  , optReadLower, argReadLower
  , Options(..), optionsParser
  -- Re-export Turtle:
  , options
  ) where

import Options.Generic (Generic, ParseRecord, type (<?>), unHelpful)

import qualified Control.Exception

import qualified Data.Char
import qualified Data.ByteString
import qualified Data.List                        as L
import qualified Data.Map                         as Map
import           Data.Maybe
import           Data.Optional                       (Optional)
import           Data.Semigroup
import           Data.Text                           (Text, pack, unpack)
import qualified Data.Text.Lazy                   as LT
import qualified Data.Yaml

import qualified Dhall
import qualified Dhall.Import
import qualified Dhall.JSON
import qualified Dhall.Parser
import qualified Dhall.TypeCheck

import qualified GHC.IO.Encoding

import qualified System.IO
import qualified System.Exit

import           Text.Printf                         (printf)
import           Text.Trifecta.Delta                 (Delta(..))
import           Turtle                              (optional)
import           Turtle.Options

import           Prelude
import           Types



diagReadCaseInsensitive :: (Bounded a, Enum a, Read a, Show a) => String -> Maybe a
diagReadCaseInsensitive str = diagRead $ Data.Char.toLower <$> str
  where mapping    = Map.fromList [ (Data.Char.toLower <$> show x, x) | x <- enumFromTo minBound maxBound ]
        diagRead x = Just $ flip fromMaybe (Map.lookup x mapping)
                     (error $ printf ("Couldn't parse '%s' as one of: %s")
                                     str (L.intercalate ", " $ Map.keys mapping))

optReadLower :: (Bounded a, Enum a, Read a, Show a) => ArgName -> ShortName -> Optional HelpMessage -> Parser a
optReadLower = opt (diagReadCaseInsensitive . unpack)
argReadLower :: (Bounded a, Enum a, Read a, Show a) => ArgName -> Optional HelpMessage -> Parser a
argReadLower = arg (diagReadCaseInsensitive . unpack)

data Options = Options
  { oAPI           :: API
  , oBuildJob      :: Maybe BuildJob
  , oCertPass      :: Maybe Text
  , oCluster       :: Cluster
  , oDaedalusVer   :: Version
  , oOutput        :: Text
  , oPullReq       :: Maybe PullReq
  , oTestInstaller :: TestInstaller
  , oCI            :: CI
  }

optionsParser :: Parser Options
optionsParser = Options
  <$> (fromMaybe Cardano <$> (optional $
                optReadLower "api"                 'a' "Backend API:  cardano or etc"))
  <*> (optional   $
      (BuildJob  <$> optText "build-job"           'b' "CI Build Job/ID"))
  <*> (optional   $
                     optText "cert-pass"           'p' "Certificate password")
  <*> (fromMaybe Mainnet <$> (optional $
                optReadLower "cluster"             'c' "Cluster the resulting installer will target:  mainnet or staging"))
  <*> (fromMaybe "dev"   <$> (optional $
      (Version   <$> optText "daedalus-version"    'v' "Daedalus version string")))
  <*>                optText "output"              'o' "Installer output file"
  <*> (optional   $
      (PullReq   <$> optText "pull-request"        'r' "Pull request #"))
  <*> flag testInstaller     "test-installer"      't' "Test installers after building"
  <*> pure Buildkite -- NOTE: this is filled in by auto-detection



lshow :: Show a => a -> Text
lshow = pack . fmap Data.Char.toLower . show

dhallTopExpr :: Text -> Config -> OS -> Cluster -> Text
dhallTopExpr path Launcher os cluster = path <> "/launcher.dhall ( "<>path<>"/" <> lshow cluster <> ".dhall "<>path<>"/" <> lshow os <> ".dhall ) "<>path<>"/" <> lshow os <> ".dhall"
dhallTopExpr path Topology os cluster = path <> "/topology.dhall ( "<>path<>"/" <> lshow cluster <> ".dhall "<>path<>"/" <> lshow os <> ".dhall )"

data Options' = Options'
    { explain  :: Bool <?> "Explain error messages in detail"
    , omitNull :: Bool <?> "Omit record fields that are null"
    } deriving (Generic, ParseRecord)

toYaml :: Options' -> Dhall.Text -> IO Data.ByteString.ByteString
toYaml Options'{..} inText =
  (if Options.Generic.unHelpful explain then Dhall.detailed else id) $ (do
    expr <- case Dhall.Parser.exprFromText (Directed "(stdin)" 0 0 0 0) inText of
              Left  err  -> Control.Exception.throwIO err
              Right expr -> return expr

    expr' <- Dhall.Import.load expr
    case Dhall.TypeCheck.typeOf expr' of
      Left  err -> Control.Exception.throwIO err
      Right _   -> return ()

    json <- case Dhall.JSON.dhallToJSON expr' of
      Left err  -> Control.Exception.throwIO err
      Right json -> return json

    let filteredJSON =
          if Options.Generic.unHelpful omitNull
          then Dhall.JSON.omitNull json
          else json

    pure $ Data.Yaml.encode filteredJSON )

generateConfig :: Request -> FilePath -> FilePath -> IO ()
generateConfig Request{..} configRoot outFile = handle $ do
  GHC.IO.Encoding.setLocaleEncoding GHC.IO.Encoding.utf8

  Dhall.detailed $ do
    let inText = LT.fromStrict $ dhallTopExpr (pack configRoot) rConfig rOS rCluster
    expr <- case Dhall.Parser.exprFromText (Directed "(stdin)" 0 0 0 0) inText of
              Left  err  -> Control.Exception.throwIO err
              Right expr -> return expr

    expr' <- Dhall.Import.load expr
    case Dhall.TypeCheck.typeOf expr' of
      Left  err -> Control.Exception.throwIO err
      Right _   -> return ()

    json <- case Dhall.JSON.dhallToJSON expr' of
              Left err  -> Control.Exception.throwIO err
              Right json -> return json

    Data.ByteString.writeFile outFile (Data.Yaml.encode json)

-- | Generic error handler: be it encoding/decoding, file IO, parsing or type-checking.
handle :: IO a -> IO a
handle = Control.Exception.handle handler
  where
    handler :: Control.Exception.SomeException -> IO a
    handler e = do
        System.IO.hPutStrLn System.IO.stderr ""
        System.IO.hPrint    System.IO.stderr e
        System.Exit.exitFailure
