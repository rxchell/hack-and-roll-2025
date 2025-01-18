import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { View, Alert, ScrollView, Text} from 'react-native'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { styles } from './styles'
import Avatar from './Avatar'
import React from 'react'

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [points, setPoints] = useState<number>(0)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('users')
        .select(`username, points, profileImage`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }
      //console.debug(data);
      if (data) {
        setUsername(data.username)
        setPoints(data.points)
        setProfileImage(data.profileImage) // Set the profile image URL
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ username, profileImage }: { username: string, profileImage?: string }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')
      
      const updates = {
        id: session?.user.id,
        username,
        profileImage: profileImage,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('users').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Avatar
            size={200}
            url={profileImage}
            onUpload={(url: string) => {
              setProfileImage(url);
              updateProfile({ username, profileImage: url });
            }}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input label="Email" value={session?.user?.email} disabled />
        </View>
        <View style={styles.verticallySpaced}>
          <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
        </View>
        <View style={styles.verticallySpaced}>
          <Text style={styles.pointsText}>Available Points: {points}</Text>
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? 'Loading ...' : 'Update'}
            buttonStyle={styles.button}
            onPress={() => updateProfile({ username })}
            disabled={loading}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Button buttonStyle={styles.button} title="Sign Out" onPress={() => supabase.auth.signOut()} />
        </View>
      </View>
    </ScrollView>
  );
}






/*
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { View, Alert, Text } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { styles } from './styles'

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [points, setPoints] = useState<number>(0)

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('users')
        .select(`username, points`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setPoints(data.points)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
  }: {
    username: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('users').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.pointsText}>
          Available Points: {points}
        </Text>
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          buttonStyle={styles.button}
          onPress={() => updateProfile({ username, })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button buttonStyle={styles.button} title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  )
}
*/
