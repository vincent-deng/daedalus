{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE LambdaCase #-}
module Types
  ( API(..)
  , OS(..)
  , Cluster(..)
  , Config(..)
  , CI(..)
  , Request(..)
  -- *
  , flag
  -- *
  , TestInstaller, testInstaller
  -- *
  , BuildJob(..), PullReq(..), Version(..)
  )
where

import           Data.Optional                       (Optional)
import           Data.Text                           (Text, toLower)
import           Data.String                         (IsString)
import qualified Universum
import           Prelude
import           Turtle.Options



data API
  = Cardano
  | ETC
  deriving (Bounded, Enum, Eq, Read, Show)

data OS
  = Linux
  | Macos64
  | Win64
  deriving (Eq, Show)

data Cluster
  = Mainnet
  | Staging
  deriving (Bounded, Enum, Eq, Read, Show)

data Config
  = Launcher
  | Topology
  deriving (Eq, Show)

data CI
  = Appveyor
  | Travis
  | Buildkite
  | Manual
  deriving (Bounded, Enum, Eq, Read, Show)

data Request
  = Request
  { rOS      :: OS
  , rCluster :: Cluster
  , rConfig  :: Config
  } deriving (Eq, Show)



data TestInstaller   = DontTestInstaller       | TestInstaller       deriving (Eq, Show)
testInstaller :: Bool -> TestInstaller
testInstaller True  = TestInstaller
testInstaller False = DontTestInstaller

newtype BuildJob     = BuildJob     { fromBuildJob     :: Text } deriving (Eq, IsString, Show)
newtype PullReq      = PullReq      { fromPullReq      :: Text } deriving (Eq, IsString, Show)
newtype Version      = Version      { fromVer          :: Text } deriving (Eq, IsString, Show)



flag
  :: (Bool -> a)           -- ^ Lift a value from Bool.
  -> ArgName               -- ^ Long form of the switch.
  -> Char                  -- ^ Short form of the switch.
  -> Optional HelpMessage  -- ^ Help message.
  -> Parser a
flag lift long ch help = lift <$> switch long ch help

lowerShowT :: Show a => a -> Text
lowerShowT = toLower . Universum.show
