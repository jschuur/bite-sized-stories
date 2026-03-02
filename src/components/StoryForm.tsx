'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { difficultyLevels, getRandomTopic, supportedLanguages } from '@/config';
import { env } from '@/env';

interface StoryFormProps {
  onSubmit: (data: {
    targetLanguage: string;
    storyLength: number;
    difficultyLevel: string;
    topic: string;
    includeVocabulary: boolean;
    includeGrammarTips: boolean;
  }) => Promise<void>;
  isLoading: boolean;
}

export function StoryForm({ onSubmit, isLoading }: StoryFormProps) {
  const [targetLanguage, setTargetLanguage] = useState(env.NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE);
  const [storyLength, setStoryLength] = useState(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH.toString());
  const [difficultyLevel, setDifficultyLevel] = useState(env.NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL);
  const [topic, setTopic] = useState<string>(() => {
    const defaultTopic = env.NEXT_PUBLIC_DEFAULT_TOPIC;

    if (defaultTopic && defaultTopic.trim() && defaultTopic !== 'undefined')
      return defaultTopic;

    return getRandomTopic();
  });
  const vocabularyDisabled = env.NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX;
  const grammarDisabled = env.NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX;

  const [includeVocabulary, setIncludeVocabulary] = useState(
    vocabularyDisabled ? false : env.NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY,
  );
  const [includeGrammarTips, setIncludeGrammarTips] = useState(
    grammarDisabled ? false : env.NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR,
  );
  const [error, setError] = useState('');

  const handleStoryLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoryLength(e.target.value);
  };

  const handleStoryLengthBlur = () => {
    if (storyLength === '') return;

    const numValue = parseInt(storyLength, 10);

    if (!isNaN(numValue)) {
      const clamped = Math.max(
        env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN,
        Math.min(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX, numValue),
      );

      setStoryLength(clamped.toString());
    }
  };

  const handleSubmit = async () => {
    if (!targetLanguage || !storyLength || !difficultyLevel || !topic) {
      setError('Please fill in all fields');

      return;
    }

    setError('');

    try {
      await onSubmit({
        targetLanguage,
        storyLength: parseInt(storyLength),
        difficultyLevel,
        topic,
        includeVocabulary: vocabularyDisabled ? false : includeVocabulary,
        includeGrammarTips: grammarDisabled ? false : includeGrammarTips,
      });
    } catch (err) {
      console.error('Form submission failed:', err);
      setError('Failed to submit form. Please try again.');
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold'>Create a Story</h3>
        <p className='text-sm text-muted-foreground'>What kind of story do you want to generate?</p>
      </div>

      <div className='flex flex-col gap-6 sm:flex-row'>
        <div className='space-y-2'>
          <Label htmlFor='language'>Target Language</Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger id='language' className='w-auto min-w-45'>
              <SelectValue placeholder='Select language' />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((language) => (
                <SelectItem key={language.languageCode} value={language.languageCode}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='length'>Length (words)</Label>
          <Input
            id='length'
            type='number'
            value={storyLength}
            max={env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX}
            min={env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN}
            onChange={handleStoryLengthChange}
            onBlur={handleStoryLengthBlur}
            className='w-auto min-w-30'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='difficulty'>Difficulty (CEFR)</Label>
          <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
            <SelectTrigger id='difficulty' className='w-auto min-w-35'>
              <SelectValue placeholder='Select level'>
                {difficultyLevels[difficultyLevel]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(difficultyLevels).map((level) => (
                <SelectItem key={level} value={level}>
                  {difficultyLevels[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Label htmlFor='topic'>Topic</Label>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-6 w-6 p-0'
            onClick={() => setTopic((currentTopic) => getRandomTopic(currentTopic))}
            disabled={isLoading}
          >
            <RefreshCw className='h-3 w-3' />
          </Button>
        </div>
        <Textarea
          id='topic'
          placeholder='Describe the topic or theme for your story...'
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
        />
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          Pick a random suggestion or enter your own
        </p>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='include-vocabulary'
            checked={includeVocabulary}
            onChange={(e) => setIncludeVocabulary(e.target.checked)}
            disabled={vocabularyDisabled}
          />
          <Label
            htmlFor='include-vocabulary'
            className={
              vocabularyDisabled
                ? 'text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                : 'cursor-pointer'
            }
          >
            Include vocabulary
          </Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='include-grammar-tips'
            checked={includeGrammarTips}
            onChange={(e) => setIncludeGrammarTips(e.target.checked)}
            disabled={grammarDisabled}
          />
          <Label
            htmlFor='include-grammar-tips'
            className={
              grammarDisabled
                ? 'text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
                : 'cursor-pointer'
            }
          >
            Include grammar tips
          </Label>
        </div>
      </div>

      {error && (
        <div className='rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400'>
          {error}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={isLoading} className='w-full' size='lg'>
        {isLoading ? <>Generating Story...</> : 'Generate Story'}
      </Button>
    </div>
  );
}
